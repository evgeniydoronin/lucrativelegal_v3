// =============================================================================
// Future Marketing Cards - Refactored Version
// =============================================================================

/**
 * Future Marketing Cards Component
 * Горизонтальный скролл карточек с прогресс индикатором
 * 
 * Использует:
 * - AnimatedInteractiveComponent для базовой архитектуры
 * - AnimationService для управления ScrollTrigger
 * - Правильный lifecycle и cleanup
 */

class FutureMarketing extends AnimatedInteractiveComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Конфигурация компонента
            totalCards: 7,
            cardWidths: {
                mobile: 368,
                tablet: 460,
                desktop: 575
            },
            gaps: {
                mobile: 48,
                desktop: 64
            },
            paddings: {
                mobile: 0.25, // 25vw
                desktop: 0.5   // 50vw
            },
            paddingTops: {
                mobile: 60,
                tablet: 70,
                desktop: 80
            },
            
            // Анимация
            scrub: 1,
            anticipatePin: 1,
            
            // Debug
            debug: false,
            
            // События
            onCardChange: null,
            onProgressUpdate: null
        };
    }
    
    // =============================================================================
    // Lifecycle Methods (BaseComponent)
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Инициализируем свойства (НЕ в constructor!)
        this.state = {
            currentCard: 0,
            totalCards: this.options.totalCards,
            trackWidth: 0,
            viewportWidth: 0,
            isScrolling: false,
            progress: 0
        };
        
        // Элементы
        this.elements = {
            spacer: null,
            viewer: null,
            track: null,
            cards: [],
            progressIndicator: null
        };
        
        // Анимации (отдельные свойства, НЕ переопределяем this.animations!)
        this.mainTimeline = null;
        
        this.log('debug', 'Future Marketing beforeInit - конфигурация готова');
        return true;
    }
    
    setupElements() {
        // Найти основные элементы
        this.elements.spacer = this.element.querySelector('.future-cards-spacer');
        this.elements.viewer = this.element.querySelector('.future-cards-viewer');
        this.elements.track = this.element.querySelector('.future-cards-track');
        this.elements.cards = Array.from(this.element.querySelectorAll('.future-card'));
        
        // Валидация элементов
        const requiredElements = ['spacer', 'viewer', 'track'];
        const missingElements = requiredElements.filter(key => !this.elements[key]);
        
        if (missingElements.length > 0) {
            this.log('error', `Missing required elements: ${missingElements.join(', ')}`);
            return false;
        }
        
        if (this.elements.cards.length === 0) {
            this.log('error', 'No cards found');
            return false;
        }
        
        // Обновить состояние
        this.state.totalCards = this.elements.cards.length;
        
        this.log('info', `Found ${this.state.totalCards} cards`);
        return true;
    }
    
    bindEvents() {
        // Используем BaseComponent систему событий
        this.addEventHandler(window, 'load', () => {
            this.handleWindowLoad();
        });
        
        // Debounced resize через BaseComponent
        this.addEventHandler(window, 'resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        this.log('debug', 'Events bound');
    }
    
    setupAnimations() {
        // Получаем AnimationService
        this.animationService = window.AnimationService?.getInstance();
        
        if (!this.animationService) {
            this.log('error', 'AnimationService not available');
            return false;
        }
        
        // Рассчитать размеры
        this.calculateDimensions();
        
        // Создать главную анимацию через AnimationService
        this.mainTimeline = this.animationService.scrollTriggerManager.createMasterTimeline({
            id: `${this.id}_main_timeline`,
            trigger: this.elements.spacer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: this.options.scrub,
            pin: this.elements.viewer,
            anticipatePin: this.options.anticipatePin,
            onUpdate: (self) => {
                this.handleScrollUpdate(self.progress);
            },
            onEnter: () => {
                this.handleScrollEnter();
            },
            onLeave: () => {
                this.handleScrollLeave();
            },
            onEnterBack: () => {
                this.handleScrollEnterBack();
            },
            onLeaveBack: () => {
                this.handleScrollLeaveBack();
            }
        });
        
        if (!this.mainTimeline) {
            this.log('error', 'Failed to create main timeline');
            return false;
        }
        
        // Добавить анимацию горизонтального движения
        const moveDistance = -(this.state.trackWidth - this.state.viewportWidth);
        
        this.mainTimeline.to(this.elements.track, {
            x: moveDistance,
            ease: 'none',
            duration: 1
        });
        
        // Регистрировать анимацию в компоненте (как в Services - НЕ вызываем addAnimation)
        // this.addAnimation(this.mainTimeline, 'main_scroll_timeline');
        
        this.log('info', 'Horizontal scroll animation created', {
            moveDistance,
            trackWidth: this.state.trackWidth,
            viewportWidth: this.state.viewportWidth
        });
        
        return true;
    }
    
    afterInit() {
        // Создать прогресс индикатор
        this.createProgressIndicator();
        
        // Установить начальное состояние
        this.updateProgressIndicator(0);
        
        this.log('info', 'Future Marketing component fully initialized', {
            cards: this.state.totalCards,
            trackWidth: this.state.trackWidth,
            viewportWidth: this.state.viewportWidth
        });
    }
    
    // =============================================================================
    // Размеры и расчеты
    // =============================================================================
    
    calculateDimensions() {
        // Получить размеры viewport
        this.state.viewportWidth = window.innerWidth;
        
        // Рассчитать размеры карточек
        const cardWidth = this.getCardWidth();
        const gap = this.getGapWidth();
        const padding = this.getPaddingWidth();
        
        // Общая ширина track
        this.state.trackWidth = padding + 
            (this.state.totalCards * cardWidth) + 
            (gap * (this.state.totalCards - 1)) + 
            padding;
        
        // Установить высоту spacer
        this.setupSpacerHeight();
        
        // Позиционировать viewer
        this.setupViewerPosition();
        
        this.log('debug', 'Dimensions calculated', {
            viewportWidth: this.state.viewportWidth,
            cardWidth,
            gap,
            padding,
            trackWidth: this.state.trackWidth
        });
    }
    
    getCardWidth() {
        const { mobile, tablet, desktop } = this.options.cardWidths;
        
        if (this.state.viewportWidth <= 768) return mobile;
        if (this.state.viewportWidth <= 1024) return tablet;
        return desktop;
    }
    
    getGapWidth() {
        const { mobile, desktop } = this.options.gaps;
        return this.state.viewportWidth <= 768 ? mobile : desktop;
    }
    
    getPaddingWidth() {
        const { mobile, desktop } = this.options.paddings;
        const ratio = this.state.viewportWidth <= 768 ? mobile : desktop;
        return this.state.viewportWidth * ratio;
    }
    
    getPaddingTop() {
        const { mobile, tablet, desktop } = this.options.paddingTops;
        
        if (this.state.viewportWidth <= 768) return mobile;
        if (this.state.viewportWidth <= 1024) return tablet;
        return desktop;
    }
    
    setupSpacerHeight() {
        const scrollDistance = this.state.trackWidth - this.state.viewportWidth;
        const spacerHeight = Math.max(scrollDistance * 0.5, 300);
        
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        const finalHeight = `calc(${spacerHeight}px + ${headerHeight}px)`;
        const minHeight = `calc(100vh + ${this.getPaddingTop()}px)`;
        
        this.elements.spacer.style.height = finalHeight;
        this.elements.spacer.style.minHeight = minHeight;
        
        this.log('debug', 'Spacer height set', { finalHeight, minHeight });
    }
    
    setupViewerPosition() {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        if (headerHeight) {
            const viewerTop = `${headerHeight}px`;
            const viewerHeight = `calc(100vh - ${headerHeight}px)`;
            
            this.elements.viewer.style.top = viewerTop;
            this.elements.viewer.style.height = viewerHeight;
            
            this.log('debug', 'Viewer positioned', { viewerTop, viewerHeight });
        }
    }
    
    // =============================================================================
    // Прогресс индикатор
    // =============================================================================
    
    createProgressIndicator() {
        // Проверить существующий индикатор
        this.elements.progressIndicator = this.elements.viewer.querySelector('.future-cards-progress');
        
        if (!this.elements.progressIndicator) {
            this.elements.progressIndicator = document.createElement('div');
            this.elements.progressIndicator.className = 'future-cards-progress';
            this.elements.viewer.appendChild(this.elements.progressIndicator);
            
            this.log('debug', 'Progress indicator created');
        }
    }
    
    updateProgressIndicator(progress) {
        if (this.elements.progressIndicator) {
            const progressWidth = Math.max(0, Math.min(100, progress * 100));
            this.elements.progressIndicator.style.width = `${progressWidth}%`;
        }
    }
    
    // =============================================================================
    // Обработчики событий
    // =============================================================================
    
    handleScrollUpdate(progress) {
        this.state.progress = progress;
        
        // Обновить текущую карточку
        const currentCard = Math.floor(progress * this.state.totalCards) + 1;
        const clampedCard = Math.min(currentCard, this.state.totalCards);
        
        if (this.state.currentCard !== clampedCard) {
            const oldCard = this.state.currentCard;
            this.state.currentCard = clampedCard;
            
            // Эмитировать событие смены карточки
            this.emit('cardChanged', {
                currentCard: this.state.currentCard,
                previousCard: oldCard,
                progress
            });
            
            // Вызвать callback если есть
            if (this.options.onCardChange) {
                this.options.onCardChange(this.state.currentCard, oldCard, progress);
            }
        }
        
        // Обновить прогресс индикатор
        this.updateProgressIndicator(progress);
        
        // Эмитировать событие обновления прогресса
        this.emit('progressUpdated', { progress });
        
        // Вызвать callback если есть
        if (this.options.onProgressUpdate) {
            this.options.onProgressUpdate(progress);
        }
    }
    
    handleScrollEnter() {
        this.state.isScrolling = true;
        this.emit('scrollEntered');
        this.log('debug', 'Scroll entered - pinning started');
    }
    
    handleScrollLeave() {
        this.state.isScrolling = false;
        this.emit('scrollLeft');
        this.log('debug', 'Scroll left');
    }
    
    handleScrollEnterBack() {
        this.state.isScrolling = true;
        this.emit('scrollEnteredBack');
        this.log('debug', 'Scroll entered back');
    }
    
    handleScrollLeaveBack() {
        this.state.isScrolling = false;
        this.emit('scrollLeftBack');
        this.log('debug', 'Scroll left back');
    }
    
    handleWindowLoad() {
        this.refreshScrollTrigger();
        this.log('debug', 'Window loaded - ScrollTrigger refreshed');
    }
    
    handleResize() {
        this.log('debug', 'Handling resize');
        
        // Пересчитать размеры
        this.calculateDimensions();
        
        // Обновить анимацию
        if (this.mainTimeline) {
            const moveDistance = -(this.state.trackWidth - this.state.viewportWidth);
            
            // Обновить анимацию движения
            this.mainTimeline.clear();
            this.mainTimeline.to(this.elements.track, {
                x: moveDistance,
                ease: 'none',
                duration: 1
            });
        }
        
        // Обновить ScrollTrigger
        this.refreshScrollTrigger();
        
        this.emit('resized', {
            viewportWidth: this.state.viewportWidth,
            trackWidth: this.state.trackWidth
        });
        
        this.log('debug', 'Resize handled');
    }
    
    // =============================================================================
    // Публичные методы
    // =============================================================================
    
    /**
     * Получить информацию о текущем состоянии
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            currentCard: this.state.currentCard,
            totalCards: this.state.totalCards,
            progress: this.state.progress,
            isScrolling: this.state.isScrolling,
            trackWidth: this.state.trackWidth,
            viewportWidth: this.state.viewportWidth
        };
    }
    
    /**
     * Получить информацию о карточке
     */
    getCardInfo(index) {
        if (index < 0 || index >= this.elements.cards.length) {
            return null;
        }
        
        const card = this.elements.cards[index];
        return {
            index,
            element: card,
            isActive: index + 1 === this.state.currentCard,
            rect: card.getBoundingClientRect()
        };
    }
    
    /**
     * Получить прогресс скролла
     */
    getScrollProgress() {
        return this.state.progress;
    }
    
    /**
     * Обновить ScrollTrigger
     */
    refreshScrollTrigger() {
        if (this.animationService && this.animationService.scrollTriggerManager) {
            this.animationService.scrollTriggerManager.refresh();
        }
    }
    
    /**
     * Программно установить прогресс (для тестирования)
     */
    setProgress(progress) {
        if (this.mainTimeline && this.mainTimeline.progress) {
            this.mainTimeline.progress(progress);
        }
    }
    
    // =============================================================================
    // Cleanup (BaseComponent)
    // =============================================================================
    
    destroy() {
        // Удалить прогресс индикатор
        if (this.elements.progressIndicator) {
            this.elements.progressIndicator.remove();
            this.elements.progressIndicator = null;
        }
        
        // Очистить состояние
        this.state = {
            currentCard: 0,
            totalCards: 0,
            trackWidth: 0,
            viewportWidth: 0,
            isScrolling: false,
            progress: 0
        };
        
        // Очистить элементы
        this.elements = {
            spacer: null,
            viewer: null,
            track: null,
            cards: [],
            progressIndicator: null
        };
        
        // Вызвать родительский destroy
        super.destroy();
        
        this.log('info', 'Future Marketing component destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.FutureMarketing = FutureMarketing;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FutureMarketing;
}
