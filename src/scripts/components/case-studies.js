// =============================================================================
// Case Studies - Horizontal Scroll Component (Refactored)
// Использует AnimationService и BaseComponent архитектуру
// =============================================================================

class CaseStudiesHorizontalScroll extends AnimatedInteractiveComponent {
    constructor(element) {
        super(element, {
            debug: true,
            throttle: 16,
            useAnimationService: true
        });
        
        // DOM элементы
        this.section = null;
        this.container = null;
        this.slidesWrapper = null;
        this.slides = [];
        this.indicators = [];
        
        // Состояние компонента
        this.timeline = null;
        this.currentSlideIndex = 0;
        this.scrollDistance = 0;
    }
    
    /**
     * ✅ ИСПРАВЛЕНИЕ: Инициализация конфигурации в beforeInit()
     */
    beforeInit() {
        super.beforeInit();
        
        // ✅ Настройки инициализируются в beforeInit() как в hero-cube
        this.config = {
            refreshPriority: 1,
            snapDuration: { min: 0.2, max: 0.6 },
            snapDelay: 0.1,
            snapEase: 'power2.inOut',
            slideAnimationDuration: 0.8,
            slideAnimationEase: 'power2.out'
        };
        
        console.log('🎢 CaseStudiesHorizontalScroll beforeInit - конфигурация готова');
    }
    
    /**
     * Поиск DOM элементов
     */
    setupElements() {
        super.setupElements();
        
        this.section = this.element;
        this.container = this.element.querySelector('.horizontal-scroll-container');
        this.slidesWrapper = this.element.querySelector('.slides-wrapper');
        this.slides = Array.from(this.element.querySelectorAll('.slide'));
        
        if (!this.container || !this.slidesWrapper || !this.slides.length) {
            console.warn('⚠️ Case Studies elements not found');
            return false;
        }
        
        console.log(`✅ Found ${this.slides.length} slides for horizontal scroll`);
        return true;
    }
    
    /**
     * Настройка анимаций через AnimationService
     */
    setupAnimations() {
        if (!this.animationService) {
            console.warn('⚠️ AnimationService not available, using fallback');
            this.setupAnimationsFallback();
            return;
        }
        
        this.calculateScrollDistance();
        this.createHorizontalScrollAnimation();
        this.createSlideAnimations();
        this.setupSlideIndicators();
        
        console.log('✅ Case Studies animations setup with AnimationService');
    }
    
    /**
     * Расчет дистанции скролла
     */
    calculateScrollDistance() {
        this.scrollDistance = (this.slides.length - 1) * window.innerWidth;
        console.log(`📏 Scroll distance calculated: ${this.scrollDistance}px for ${this.slides.length} slides`);
    }
    
    /**
     * Создание основной горизонтальной анимации
     */
    createHorizontalScrollAnimation() {
        // Создаем timeline через AnimationService
        this.timeline = this.animationService.scrollTriggerManager.createMasterTimeline({
            id: 'case_studies_horizontal',
            trigger: this.container,
            pin: this.container,
            refreshPriority: this.config.refreshPriority,
            scrub: 1,
            start: 'top top',
            end: `+=${this.scrollDistance}`,
            snap: {
                snapTo: 1 / (this.slides.length - 1),
                duration: this.config.snapDuration,
                delay: this.config.snapDelay,
                ease: this.config.snapEase
            },
            onUpdate: (self) => {
                this.updateSlideIndicators(self.progress);
            },
            invalidateOnRefresh: true,
            anticipatePin: 1
        });
        
        if (this.timeline) {
            // Добавляем горизонтальное движение
            this.timeline.to(this.slidesWrapper, {
                x: -this.scrollDistance,
                ease: 'none'
            });
            
            console.log('✅ Horizontal scroll timeline created');
        } else {
            console.warn('⚠️ Failed to create timeline, using fallback');
            this.setupAnimationsFallback();
        }
    }
    
    /**
     * Создание анимаций для отдельных слайдов
     */
    createSlideAnimations() {
        this.slides.forEach((slide, index) => {
            const slideContent = slide.querySelector('.slide-content');
            if (!slideContent) return;
            
            // Устанавливаем начальное состояние
            gsap.set(slideContent, { opacity: 0, y: 50 });
            
            // Создаем ScrollTrigger для каждого слайда через AnimationService
            this.animationService.scrollTriggerManager.create({
                id: `case_studies_slide_${index}`,
                trigger: slide,
                containerAnimation: this.timeline,
                start: 'left 80%',
                end: 'right 20%',
                onEnter: () => {
                    gsap.to(slideContent, {
                        opacity: 1,
                        y: 0,
                        duration: this.config.slideAnimationDuration,
                        ease: this.config.slideAnimationEase
                    });
                },
                onLeave: () => {
                    gsap.to(slideContent, {
                        opacity: 0.7,
                        duration: 0.3
                    });
                },
                onEnterBack: () => {
                    gsap.to(slideContent, {
                        opacity: 1,
                        y: 0,
                        duration: this.config.slideAnimationDuration,
                        ease: this.config.slideAnimationEase
                    });
                },
                onLeaveBack: () => {
                    gsap.to(slideContent, {
                        opacity: 0.7,
                        duration: 0.3
                    });
                }
            });
        });
        
        console.log(`✅ Created animations for ${this.slides.length} slides`);
    }
    
    /**
     * Настройка индикаторов слайдов
     */
    setupSlideIndicators() {
        // Удаляем существующие индикаторы
        const existingIndicators = this.container.querySelector('.slide-indicators');
        if (existingIndicators) {
            existingIndicators.remove();
        }
        
        // Создаем контейнер индикаторов
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'slide-indicators';
        
        // Создаем индикаторы
        this.indicators = [];
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'slide-indicator';
            if (index === 0) indicator.classList.add('active');
            
            // Добавляем обработчик клика через InteractiveComponent
            this.addEventHandler(indicator, 'click', () => {
                this.goToSlide(index);
            });
            
            this.indicators.push(indicator);
            indicatorsContainer.appendChild(indicator);
        });
        
        // Добавляем в контейнер
        this.container.appendChild(indicatorsContainer);
        
        // Применяем стили
        this.styleIndicators(indicatorsContainer);
        
        console.log(`✅ Created ${this.indicators.length} slide indicators`);
    }
    
    /**
     * Стилизация индикаторов
     */
    styleIndicators(container) {
        // Стили контейнера
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
            zIndex: '100',
            pointerEvents: 'auto'
        });
        
        // Стили индикаторов
        this.indicators.forEach(indicator => {
            Object.assign(indicator.style, {
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(255, 255, 255, 0.6)'
            });
            
            // Hover эффекты через InteractiveComponent
            this.addEventHandler(indicator, 'mouseenter', () => {
                if (!indicator.classList.contains('active')) {
                    indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                }
            });
            
            this.addEventHandler(indicator, 'mouseleave', () => {
                if (!indicator.classList.contains('active')) {
                    indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                }
            });
        });
    }
    
    /**
     * Обновление индикаторов слайдов
     */
    updateSlideIndicators(progress) {
        if (!this.indicators || !this.indicators.length) {
            return;
        }
        
        const currentSlideIndex = Math.round(progress * (this.slides.length - 1));
        
        if (currentSlideIndex !== this.currentSlideIndex) {
            this.currentSlideIndex = currentSlideIndex;
            
            this.indicators.forEach((indicator, index) => {
                if (index === currentSlideIndex) {
                    indicator.classList.add('active');
                    indicator.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                    indicator.style.transform = 'scale(1.2)';
                } else {
                    indicator.classList.remove('active');
                    indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                    indicator.style.transform = 'scale(1)';
                }
            });
        }
    }
    
    /**
     * Переход к конкретному слайду
     */
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) {
            console.warn(`⚠️ Invalid slide index: ${index}`);
            return;
        }
        
        const progress = index / (this.slides.length - 1);
        const scrollTrigger = this.timeline?.scrollTrigger;
        
        if (scrollTrigger) {
            const targetScroll = scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
            
            // Используем Lenis если доступен
            if (window.app && window.app.lenis) {
                window.app.lenis.scrollTo(targetScroll, {
                    duration: 1.2,
                    easing: (t) => 1 - Math.pow(1 - t, 3)
                });
            } else {
                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
            
            console.log(`🎯 Navigating to slide ${index}`);
        }
    }
    
    /**
     * Fallback для случаев без AnimationService
     */
    setupAnimationsFallback() {
        console.log('🔄 Setting up fallback animations');
        
        this.calculateScrollDistance();
        
        // Создаем timeline напрямую через GSAP
        this.timeline = gsap.timeline({
            scrollTrigger: {
                trigger: this.container,
                pin: this.container,
                refreshPriority: this.config.refreshPriority,
                scrub: 1,
                start: 'top top',
                end: `+=${this.scrollDistance}`,
                snap: {
                    snapTo: 1 / (this.slides.length - 1),
                    duration: this.config.snapDuration,
                    delay: this.config.snapDelay,
                    ease: this.config.snapEase
                },
                onUpdate: (self) => {
                    this.updateSlideIndicators(self.progress);
                },
                invalidateOnRefresh: true,
                anticipatePin: 1
            }
        });
        
        // Добавляем горизонтальное движение
        this.timeline.to(this.slidesWrapper, {
            x: -this.scrollDistance,
            ease: 'none'
        });
        
        // Создаем анимации слайдов
        this.slides.forEach((slide, index) => {
            const slideContent = slide.querySelector('.slide-content');
            if (!slideContent) return;
            
            gsap.set(slideContent, { opacity: 0, y: 50 });
            
            ScrollTrigger.create({
                trigger: slide,
                containerAnimation: this.timeline,
                start: 'left 80%',
                end: 'right 20%',
                onEnter: () => {
                    gsap.to(slideContent, {
                        opacity: 1,
                        y: 0,
                        duration: this.config.slideAnimationDuration,
                        ease: this.config.slideAnimationEase
                    });
                },
                onLeave: () => {
                    gsap.to(slideContent, {
                        opacity: 0.7,
                        duration: 0.3
                    });
                },
                onEnterBack: () => {
                    gsap.to(slideContent, {
                        opacity: 1,
                        y: 0,
                        duration: this.config.slideAnimationDuration,
                        ease: this.config.slideAnimationEase
                    });
                },
                onLeaveBack: () => {
                    gsap.to(slideContent, {
                        opacity: 0.7,
                        duration: 0.3
                    });
                }
            });
        });
        
        this.setupSlideIndicators();
    }
    
    /**
     * Обновление размеров при resize
     */
    handleResize() {
        super.handleResize();
        
        this.calculateScrollDistance();
        
        if (this.timeline && this.timeline.scrollTrigger) {
            this.timeline.scrollTrigger.refresh();
        }
    }
    
    /**
     * Получение состояния компонента
     */
    getState() {
        return {
            currentSlideIndex: this.currentSlideIndex,
            totalSlides: this.slides.length,
            scrollDistance: this.scrollDistance,
            hasTimeline: !!this.timeline,
            hasIndicators: this.indicators.length > 0,
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed
        };
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        // Удаляем timeline
        if (this.timeline) {
            this.timeline.kill();
            this.timeline = null;
        }
        
        // Удаляем индикаторы
        const indicators = this.container?.querySelector('.slide-indicators');
        if (indicators) {
            indicators.remove();
        }
        
        // Очищаем массивы
        this.slides = [];
        this.indicators = [];
        
        // Вызываем родительский метод
        super.destroy();
        
        console.log('🗑️ Case Studies component destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.CaseStudiesHorizontalScroll = CaseStudiesHorizontalScroll;
}

// Функция инициализации для обратной совместимости
window.initCaseStudiesHorizontalScroll = () => {
    const element = document.querySelector('#case-studies');
    if (element) {
        return new CaseStudiesHorizontalScroll(element);
    }
    console.warn('⚠️ Case Studies element not found');
    return null;
};
