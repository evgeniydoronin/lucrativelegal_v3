// =============================================================================
// Future Marketing Cards - Horizontal Scroll - LLG v3
// =============================================================================

// Глобальная функция инициализации (обязательно!)
window.initFutureMarketingCards = function() {
    'use strict';
    
    console.log('🔧 DEBUG: initFutureMarketingCards() called');

    // Проверка зависимостей
    function checkDependencies() {
        console.log('🔧 DEBUG: Checking dependencies...');
        
        if (typeof gsap === 'undefined') {
            console.error('❌ Future Marketing Cards: GSAP is not loaded.');
            return false;
        } else {
            console.log('✅ GSAP is loaded:', gsap.version);
        }
        
        if (typeof ScrollTrigger === 'undefined') {
            console.error('❌ Future Marketing Cards: ScrollTrigger is not loaded.');
            return false;
        } else {
            console.log('✅ ScrollTrigger is loaded');
        }
        
        if (typeof Lenis === 'undefined') {
            console.warn('⚠️ Future Marketing Cards: Lenis is not loaded. Smooth scroll will be disabled.');
        } else {
            console.log('✅ Lenis is loaded');
        }
        
        return true;
    }

    // Основной класс компонента
    class FutureMarketingCards {
        constructor(element) {
            this.element = element;
            this.spacer = null;
            this.viewer = null;
            this.track = null;
            this.cards = [];
            this.currentCard = 0;
            this.totalCards = 7;
            this.timeline = null;
            this.trackWidth = 0;
            this.viewportWidth = 0;
            
            console.log('🔧 DEBUG: FutureMarketingCards constructor called with element:', element);
            
            this.init();
        }
        
        init() {
            console.log('🔧 DEBUG: FutureMarketingCards init() called');
            
            if (!this.findElements()) {
                console.error('❌ Required elements not found');
                return;
            }
            
            this.setupDimensions();
            this.setupScrollTrigger();
            this.setupProgressIndicator();
            
            console.log('✅ Future Marketing Cards initialized');
        }
        
        findElements() {
            this.spacer = this.element.querySelector('.future-cards-spacer');
            this.viewer = this.element.querySelector('.future-cards-viewer');
            this.track = this.element.querySelector('.future-cards-track');
            this.cards = Array.from(this.element.querySelectorAll('.future-card'));
            
            console.log('🔧 DEBUG: Elements found:');
            console.log('  - spacer:', !!this.spacer);
            console.log('  - viewer:', !!this.viewer);
            console.log('  - track:', !!this.track);
            console.log('  - cards:', this.cards.length);
            
            if (!this.spacer || !this.viewer || !this.track || this.cards.length === 0) {
                console.error('❌ Missing required elements:', {
                    spacer: !this.spacer,
                    viewer: !this.viewer,
                    track: !this.track,
                    cards: this.cards.length === 0
                });
                return false;
            }
            
            this.totalCards = this.cards.length;
            return true;
        }
        
        setupDimensions() {
            console.log('🔧 DEBUG: Setting up dimensions...');
            
            // Получить размеры viewport
            this.viewportWidth = window.innerWidth;
            
            // Рассчитать общую ширину track
            const cardWidth = this.getCardWidth();
            const gap = this.getGapWidth();
            const padding = this.getPaddingWidth();
            
            // Общая ширина = padding + (карточки * ширина) + (промежутки * (количество - 1)) + padding
            this.trackWidth = padding + (this.totalCards * cardWidth) + (gap * (this.totalCards - 1)) + padding;
            
            console.log('🔧 DEBUG: Dimensions calculated:');
            console.log('  - viewportWidth:', this.viewportWidth);
            console.log('  - cardWidth:', cardWidth);
            console.log('  - gap:', gap);
            console.log('  - padding:', padding);
            console.log('  - trackWidth:', this.trackWidth);
            
            // Установить высоту spacer для ScrollTrigger
            // Расстояние прокрутки = ширина track - ширина viewport
            const scrollDistance = this.trackWidth - this.viewportWidth;
            const spacerHeight = Math.max(scrollDistance * 0.5, 300); // Минимум 300vh
            
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            
            const finalHeight = `calc(${spacerHeight}px + ${headerHeight}px)`;
            this.spacer.style.height = finalHeight;
            
            console.log('🔧 DEBUG: Spacer height set to:', finalHeight);
            
            // Позиционировать viewer с учетом header
            if (headerHeight) {
                const viewerTop = `${headerHeight}px`;
                const viewerHeight = `calc(100vh - ${headerHeight}px)`;
                this.viewer.style.top = viewerTop;
                this.viewer.style.height = viewerHeight;
                
                console.log('🔧 DEBUG: Viewer positioned:');
                console.log('  - top:', viewerTop);
                console.log('  - height:', viewerHeight);
            }
            
            // Установить минимальную высоту с учетом padding-top для картинок
            const paddingTop = this.getPaddingTop();
            const minHeight = `calc(100vh + ${paddingTop}px)`;
            this.spacer.style.minHeight = minHeight;
            
            console.log('🔧 DEBUG: Spacer min-height set to:', minHeight);
        }
        
        getCardWidth() {
            // Ширина карточки в зависимости от размера экрана (увеличено на 15%)
            if (window.innerWidth <= 768) return 368; // mobile (320px * 1.15)
            if (window.innerWidth <= 1024) return 460; // tablet (400px * 1.15)
            return 575; // desktop (500px * 1.15)
        }
        
        getGapWidth() {
            // Промежуток между карточками
            if (window.innerWidth <= 768) return 48; // $space-12 = 3rem = 48px
            return 64; // $space-16 = 4rem = 64px
        }
        
        getPaddingWidth() {
            // Padding для центрирования первой и последней карточки
            if (window.innerWidth <= 768) return window.innerWidth * 0.25; // 25vw
            return window.innerWidth * 0.5; // 50vw
        }
        
        getPaddingTop() {
            // Padding-top для картинок, которые выходят за пределы карточек
            if (window.innerWidth <= 768) return 60; // mobile
            if (window.innerWidth <= 1024) return 70; // tablet
            return 80; // desktop
        }
        
        setupScrollTrigger() {
            console.log('🔧 DEBUG: Setting up ScrollTrigger...');
            
            // Рассчитать расстояние движения
            const moveDistance = -(this.trackWidth - this.viewportWidth);
            
            console.log('🔧 DEBUG: Move distance:', moveDistance);
            
            // Создать горизонтальный скролл
            this.timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: this.spacer,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1, // Более отзывчивый скролл
                    pin: this.viewer,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        this.updateProgress(self.progress);
                    },
                    onEnter: () => {
                        console.log('🔧 DEBUG: ScrollTrigger entered - pinning started');
                    },
                    onLeave: () => {
                        console.log('🔧 DEBUG: ScrollTrigger left');
                    },
                    onEnterBack: () => {
                        console.log('🔧 DEBUG: ScrollTrigger entered back');
                    },
                    onLeaveBack: () => {
                        console.log('🔧 DEBUG: ScrollTrigger left back');
                    }
                }
            });
            
            // Анимация горизонтального движения track
            this.timeline.to(this.track, {
                x: moveDistance,
                ease: 'none',
                duration: 1
            });
            
            console.log('✅ ScrollTrigger setup completed');
        }
        
        updateProgress(progress) {
            // Обновить счетчик карточек на основе прогресса
            const currentCard = Math.floor(progress * this.totalCards) + 1;
            const clampedCard = Math.min(currentCard, this.totalCards);
            
            if (this.currentCard !== clampedCard) {
                this.currentCard = clampedCard;
            }
            
            // Обновить индикатор прогресса
            this.updateProgressIndicator(progress);
        }
        
        
        updateProgressIndicator(progress) {
            // Обновить индикатор прогресса
            let progressElement = this.viewer.querySelector('.future-cards-progress');
            if (!progressElement) {
                // Создать индикатор прогресса если его нет
                progressElement = document.createElement('div');
                progressElement.className = 'future-cards-progress';
                this.viewer.appendChild(progressElement);
            }
            
            const progressWidth = Math.max(0, Math.min(100, progress * 100));
            progressElement.style.width = `${progressWidth}%`;
        }
        
        
        setupProgressIndicator() {
            // Создать индикатор прогресса
            this.updateProgressIndicator(0);
            
            console.log('✅ Progress indicator setup completed');
        }
        
        handleResize() {
            // Пересчитать размеры при изменении размера окна
            console.log('🔧 DEBUG: Handling resize...');
            
            this.setupDimensions();
            
            // Обновить ScrollTrigger
            if (this.timeline && this.timeline.scrollTrigger) {
                this.timeline.scrollTrigger.refresh();
            }
            
            console.log('✅ Resize handled');
        }
        
        destroy() {
            if (this.timeline) {
                this.timeline.kill();
            }
            
            // Очистить все анимации
            gsap.killTweensOf(this.track);
            
            // Удалить индикатор прогресса
            const progressElement = this.viewer?.querySelector('.future-cards-progress');
            if (progressElement) {
                progressElement.remove();
            }
            
            console.log('✅ Future Marketing Cards destroyed');
        }
    }

    // Debounced resize handler
    function handleResize() {
        ScrollTrigger.refresh();
        console.log('🔧 DEBUG: ScrollTrigger refreshed on resize');
    }

    // Основная логика инициализации
    if (!checkDependencies()) return;

    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector('#future-marketing');
    console.log('🔧 DEBUG: Section found:', !!section, section);
    
    if (!section) {
        console.error('❌ Section #future-marketing not found!');
        return;
    }

    // Создать экземпляр компонента
    const futureMarketingCards = new FutureMarketingCards(section);

    // Re-calculate after all assets (images/fonts) are loaded
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
        console.log('🔧 DEBUG: ScrollTrigger refreshed on window load');
    });

    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            futureMarketingCards.handleResize();
            handleResize();
        }, 250);
    });

    console.log('✅ Future Marketing Cards initialization completed');
    
    // Вернуть экземпляр для возможного внешнего управления
    return futureMarketingCards;
}

// Глобальная доступность класса (опционально)
if (typeof window !== 'undefined') {
    // Класс будет доступен только после инициализации
    window.FutureMarketingCards = null;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initFutureMarketingCards };
}
