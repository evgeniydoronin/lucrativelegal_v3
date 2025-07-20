// =============================================================================
// Hero Cube Controller - Рефакторированная версия с микросервисами
// =============================================================================

class HeroCubeController extends AnimatedInteractiveComponent {
    constructor(element) {
        // ✅ ИСПРАВЛЕНИЕ: Сначала вызываем super() (требование ES6)
        super(element, {
            // Конфигурация для BaseComponent
            debug: true,
            throttle: 16,
            useAnimationService: true
        });
        
        // ✅ ИСПРАВЛЕНИЕ: Только базовые свойства в constructor
        // Критически важные свойства перенесены в beforeInit()
        this.cube = null;
        this.cubeContainer = null;
        this.square = null;
        this.video = null;
        this.lastScrollProgress = 0;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    /**
     * ✅ ИСПРАВЛЕНИЕ: Используем правильный BaseComponent lifecycle
     * beforeInit() вызывается ДО основной инициализации
     */
    beforeInit() {
        super.beforeInit(); // Вызываем родительский метод
        
        // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Инициализируем animationPhases в beforeInit()
        // Это гарантирует что они готовы ДО вызова setupAnimations() и ScrollTrigger
        this.animationPhases = {
            rotationEnd: 0.15,       // 15% - конец вращения куба
            scaleStart: 0.16,        // 16% - начало масштабирования квадрата (снижено с 25%)
            backgroundStart: 0.45,   // 45% - начало красного фона
            swapDelay: 0.05,         // 5% - задержка подмены после вращения
            scaleOffset: 50          // 50px - отступ для начала масштабирования
        };
        
        // ✅ ИСПРАВЛЕНИЕ: Создаем namespace в beforeInit() (после super())
        this.services = {
            cube: null,
            video: null,
            positioning: null,
            scale: null,
            text: null
        };
        
        if (this.prefersReducedMotion) {
            console.log('Reduced motion preference detected, cube animation disabled');
            return;
        }
        
        console.log('🎲 HeroCubeController beforeInit - готовим микросервисы');
    }
    
    /**
     * ✅ ИСПРАВЛЕНИЕ: setupElements() - правильное место для поиска DOM элементов
     */
    setupElements() {
        super.setupElements(); // Вызываем родительский метод
        
        this.cube = this.element.querySelector('.hero-cube');
        this.cubeContainer = this.element.querySelector('.hero-cube-container');
        this.square = this.element.querySelector('.hero-square');
        this.video = this.element.querySelector('.hero-video');
        
        if (!this.cube || !this.cubeContainer || !this.square || !this.video) {
            console.warn('Hero cube elements not found');
            return false;
        }
        
        console.log('✅ All DOM elements found');
        
        // ✅ ИСПРАВЛЕНИЕ: Инициализируем сервисы ПОСЛЕ поиска DOM элементов
        this.initServices();
        
        return true;
    }
    
    /**
     * Инициализация микросервисов с использованием namespace pattern
     */
    initServices() {
        console.log('🔧 ПЕРЕД созданием сервисов:', this.services);
        
        // Инициализируем сервисы в защищенном namespace
        this.services.cube = new CubeAnimationService(this.cube, this.animationService);
        this.services.video = new VideoControlService(this.video, this.animationService);
        this.services.positioning = new PositioningService(this.cubeContainer, this.element, this.animationService);
        this.services.scale = new ScaleEffectService(this.square, this.cube, this.animationService);
        this.services.text = new TextVisibilityService(this.animationService);
        
        console.log('🔧 ПОСЛЕ создания сервисов:', this.services);
        console.log('✅ All microservices initialized in protected namespace');
    }
    
    /**
     * ✅ ИСПРАВЛЕНИЕ: afterInit() - финальная инициализация
     */
    afterInit() {
        super.afterInit(); // Вызываем родительский метод
        
        console.log('🎲 HeroCubeController initialized with microservices architecture');
    }
    
    /**
     * Переопределяем setupAnimations из BaseComponent
     * Здесь создаем ScrollTrigger в правильном lifecycle
     */
    setupAnimations() {
        console.log('🔧 В setupAnimations сервисы:', this.services);
        
        // НЕ вызываем super.setupAnimations() - создаем свой ScrollTrigger
        this.setupScrollTrigger();
    }
    
    /**
     * Настройка ScrollTrigger (переопределяем метод AnimatedComponent)
     */
    setupScrollTrigger() {
        if (!this.animationService || !this.animationService.scrollTriggerManager) {
            console.warn('AnimationService not available, using fallback ScrollTrigger');
            this.setupScrollTriggerFallback();
            return;
        }
        
        // Используем AnimationService для создания оптимизированного ScrollTrigger
        this.animationService.scrollTriggerManager.create({
            id: 'hero_cube_main',
            trigger: this.element,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
                this.updateCubeAnimation(self);
            }
        });
        
        console.log('✅ ScrollTrigger setup with AnimationService');
    }
    
    /**
     * Fallback для ScrollTrigger без AnimationService
     */
    setupScrollTriggerFallback() {
        ScrollTrigger.create({
            trigger: this.element,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
                this.updateCubeAnimation(self);
            }
        });
        
        console.log('✅ ScrollTrigger setup with fallback');
    }
    
    /**
     * Основной метод обновления анимации куба
     */
    updateCubeAnimation(scrollTrigger) {
        // Простой throttling для производительности
        const now = Date.now();
        if (!this.lastUpdateTime) this.lastUpdateTime = 0;
        
        if (now - this.lastUpdateTime < 16) { // ~60fps
            return;
        }
        this.lastUpdateTime = now;
        
        // ДИАГНОСТИКА: Логируем состояние сервисов при первом вызове
        if (!this.firstUpdateLogged) {
            console.log('🔧 ПЕРВЫЙ updateCubeAnimation - состояние сервисов:', this.services);
            this.firstUpdateLogged = true;
        }
        
        // ✅ ИСПРАВЛЕНО - Обновляем позиционирование через namespace
        if (this.services.positioning) {
            const positioningMode = this.services.positioning.checkPositioningMode();
            if (positioningMode && this.services.text) {
                this.services.text.updateTextContainersPositioning(positioningMode === 'absolute');
            }
        } else {
            console.warn('⚠️ PositioningService недоступен - позиционирование отключено');
        }
        
        // Рассчитываем прогресс скролла
        const scrollProgress = this.calculateScrollProgress();
        
        // ✅ ИСПРАВЛЕНО - Обрабатываем навигационный сброс через namespace
        if (this.services.video) {
            const isScrollingDown = scrollProgress > this.lastScrollProgress;
            this.services.video.checkNavigationReset(scrollProgress, isScrollingDown);
        }
        
        // ✅ ИСПРАВЛЕНО - Управление видео при выходе из секции через namespace
        if (this.services.video) {
            this.handleVideoOnSectionExit();
        }
        
        // ✅ ИСПРАВЛЕНО - Обрабатываем обратную анимацию при скролле вверх через namespace
        this.handleReverseAnimation(scrollProgress);
        
        // ✅ ИСПРАВЛЕНО - Основная логика анимации через namespace
        this.processAnimationPhases(scrollProgress);
        
        // ✅ ИСПРАВЛЕНО - Управление видимостью заголовков через namespace
        if (this.services.text && this.services.scale) {
            this.updateTextVisibility(scrollProgress);
        }
        
        // Сохраняем прогресс для следующего кадра
        this.lastScrollProgress = scrollProgress;
    }
    
    /**
     * Обработка фаз анимации
     */
    processAnimationPhases(scrollProgress) {
        // ✅ ЗАЩИТНАЯ ПРОВЕРКА: animationPhases должны быть инициализированы
        if (!this.animationPhases) {
            console.warn('⚠️ animationPhases not initialized yet');
            return;
        }
        
        // ✅ ИСПРАВЛЕНО - Проверки через namespace
        if (!this.services.cube || !this.services.scale) {
            console.warn('⚠️ CubeAnimationService или ScaleEffectService недоступны');
            return;
        }
        
        const { rotationEnd, scaleStart, backgroundStart } = this.animationPhases;
        
        let targetRotation = 0;
        
        // Фаза 1: Вращение (0 - rotationEnd%)
        if (scrollProgress <= rotationEnd) {
            const rotationProgress = scrollProgress / rotationEnd;
            targetRotation = rotationProgress * 360;
        } else {
            // Фаза 2: Застывание (rotationEnd - scaleStart%)
            targetRotation = 360;
        }
        
        // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Применяем вращение к кубу ТОЛЬКО если он НЕ подменен
        if (!this.services.scale.cubeToSquareSwapped) {
            this.services.cube.applyRotation(targetRotation, this.services.scale.isScalingMode);
            console.log('🎲 Вращение куба:', targetRotation + '°');
        } else {
            console.log('🔄 Куб подменен - вращение остановлено');
        }
        
        // ✅ ИСПРАВЛЕНИЕ: Проверяем подмену ПОСЛЕ применения вращения
        // Используем состояние rotationComplete вместо возвращаемого значения
        if (scrollProgress > rotationEnd && this.services.cube.rotationComplete && !this.services.scale.cubeToSquareSwapped) {
            this.services.scale.swapCubeToSquare();
            console.log('🔄 Подмена выполнена: куб → квадрат');
        }
        
        // Фаза 3: Эффект масштабирования (scaleStart - 100%)
        // 🔍 ДИАГНОСТИКА: Детальное логирование условий масштабирования
        const scaleCondition1 = scrollProgress >= scaleStart;
        const scaleCondition2 = this.services.cube.rotationComplete;
        const bothConditions = scaleCondition1 && scaleCondition2;
        
        console.log(`🔍 ДИАГНОСТИКА МАСШТАБИРОВАНИЯ:`, {
            scrollProgress: scrollProgress.toFixed(3),
            scaleStart: scaleStart,
            'scrollProgress >= scaleStart': scaleCondition1,
            'rotationComplete': scaleCondition2,
            'cubeToSquareSwapped': this.services.scale.cubeToSquareSwapped,
            'bothConditions': bothConditions
        });
        
        if (bothConditions) {
            console.log('✅ Условие масштабирования выполнено - вызываем handleScaleEffect()');
            this.handleScaleEffect(scrollProgress);
        } else {
            console.log(`❌ Условие масштабирования НЕ выполнено:`, {
                'scrollProgress >= scaleStart': scaleCondition1,
                'rotationComplete': scaleCondition2
            });
        }
        
        // Управление магнитной кнопкой
        if (this.services.video) {
            this.handlePlayButtonLogic(scrollProgress);
        }
    }
    
    /**
     * Обработка эффекта масштабирования
     */
    handleScaleEffect(scrollProgress) {
        const { scaleStart, backgroundStart } = this.animationPhases;
        
        if (!this.services.scale.isScalingMode) {
            this.services.scale.startScaleEffect();
        }
        
        // Определяем прогресс масштабирования
        let scaleProgress = 0;
        
        if (scrollProgress < backgroundStart) {
            // Фаза масштабирования
            const scalePhaseProgress = (scrollProgress - scaleStart) / (backgroundStart - scaleStart);
            scaleProgress = Math.min(1, scalePhaseProgress);
        } else {
            // Фаза красного фона - максимальный масштаб
            scaleProgress = 1;
        }
        
        // Применяем эффект масштабирования
        this.services.scale.applyScaleEffect(scaleProgress);
    }
    
    /**
     * Управление логикой магнитной кнопки
     */
    handlePlayButtonLogic(scrollProgress) {
        const { backgroundStart } = this.animationPhases;
        
        if (!this.services.scale.scaleCompleted || !this.services.scale.cubeToSquareSwapped) {
            return;
        }
        
        // Получаем информацию о заполнении viewport
        const fillInfo = this.services.scale.checkViewportFilling();
        const heroRect = this.element.getBoundingClientRect();
        const isSectionVisible = heroRect.bottom >= window.innerHeight;
        const isProgressReached = scrollProgress >= backgroundStart;
        
        // Проверяем необходимость показа кнопки
        if (this.services.video.shouldShowPlayButton(fillInfo.isFullyFilled, isSectionVisible, isProgressReached)) {
            this.services.video.showPlayButton();
        }
        
        // Проверяем необходимость скрытия кнопки
        if (this.services.video.shouldHidePlayButton(fillInfo.isFullyFilled, isSectionVisible, isProgressReached)) {
            this.services.video.hidePlayButton();
        }
    }
    
    /**
     * Обработка обратной анимации при скролле вверх
     */
    handleReverseAnimation(scrollProgress) {
        // ✅ ЗАЩИТНАЯ ПРОВЕРКА: animationPhases должны быть инициализированы
        if (!this.animationPhases) {
            console.warn('⚠️ animationPhases not initialized yet');
            return;
        }
        
        const { rotationEnd, scaleStart, backgroundStart } = this.animationPhases;
        const isScrollingUp = scrollProgress < this.lastScrollProgress;
        
        if (!isScrollingUp) return;
        
        // ✅ ИСПРАВЛЕНО - Скрываем видео если скроллим выше точки показа через namespace
        if (this.services.video && scrollProgress < backgroundStart && this.services.video.videoShown) {
            this.services.video.hideVideo();
        }
        
        // ✅ ИСПРАВЛЕНИЕ ЛОГИКИ - Возвращаем квадрат в куб только если скроллим выше точки завершения вращения
        // Это предотвращает преждевременный сброс состояния в зоне 15%-25%
        if (this.services.scale && scrollProgress < rotationEnd && this.services.scale.cubeToSquareSwapped) {
            this.services.scale.swapSquareToCube();
            this.services.scale.stopScaleEffect();
            console.log('🔄 Режим масштабирования отключен при обратном скролле (ниже rotationEnd)');
        }
        
        // Дополнительно: останавливаем масштабирование если скроллим выше scaleStart, но НЕ сбрасываем подмену
        if (this.services.scale && scrollProgress < scaleStart && this.services.scale.isScalingMode) {
            this.services.scale.stopScaleEffect();
            console.log('🔄 Режим масштабирования отключен (выше scaleStart), но подмена сохранена');
        }
    }
    
    /**
     * Управление видео при выходе из секции
     */
    handleVideoOnSectionExit() {
        const heroRect = this.element.getBoundingClientRect();
        const isHeroVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
        
        // Если секция полностью вышла из viewport И видео активно
        if (!isHeroVisible && this.services.video.videoShown) {
            console.log('🎬 Hero секция вышла из viewport - полный сброс видео');
            this.services.video.resetVideoCompletely();
        }
    }
    
    /**
     * Обновление видимости заголовков
     */
    updateTextVisibility(scrollProgress) {
        const { backgroundStart } = this.animationPhases;
        
        // Получаем информацию о состоянии
        const fillInfo = this.services.scale.checkViewportFilling();
        const heroRect = this.element.getBoundingClientRect();
        const isSectionVisible = heroRect.bottom >= window.innerHeight;
        const isProgressReached = scrollProgress >= backgroundStart;
        
        // Определяем необходимость скрытия заголовков
        const shouldHideText = this.services.text.shouldHideText(
            this.services.scale.scaleCompleted,
            this.services.scale.cubeToSquareSwapped,
            fillInfo.isFullyFilled,
            isSectionVisible,
            isProgressReached
        );
        
        // Обновляем видимость
        this.services.text.updateTextVisibility(shouldHideText);
    }
    
    /**
     * Расчет прогресса скролла через hero секцию
     */
    calculateScrollProgress() {
        const heroRect = this.element.getBoundingClientRect();
        
        // Простая логика: прогресс основан на том, насколько секция ушла вверх
        const progress = Math.max(0, -heroRect.top / heroRect.height);
        
        // Ограничиваем от 0 до 1
        return Math.min(1, progress);
    }
    
    /**
     * Программное управление кубом
     */
    rotateTo(x, y, duration = 1) {
        if (this.services.cube) {
            this.services.cube.rotateTo(x, y, duration);
        }
    }
    
    /**
     * Сброс куба в исходное положение
     */
    reset(duration = 1) {
        console.log('🎲 Сброс HeroCubeController к исходному состоянию');
        
        // Сбрасываем все сервисы через namespace
        if (this.services.cube) {
            this.services.cube.reset(duration);
        }
        
        if (this.services.video) {
            this.services.video.resetVideoCompletely();
        }
        
        if (this.services.positioning) {
            this.services.positioning.reset();
        }
        
        if (this.services.scale) {
            this.services.scale.reset();
        }
        
        if (this.services.text) {
            this.services.text.reset();
        }
        
        // Сбрасываем состояние скролла
        this.lastScrollProgress = 0;
    }
    
    /**
     * Сброс состояния видео при навигации
     */
    resetVideoState(fromNavigation = false) {
        if (this.services.video) {
            this.services.video.resetVideoState(fromNavigation);
        }
        
        // Дополнительная логика для восстановления scaleCompleted
        if (!fromNavigation && this.services.scale) {
            setTimeout(() => {
                const scrollProgress = this.calculateScrollProgress();
                const { backgroundStart } = this.animationPhases;
                
                if (scrollProgress >= backgroundStart && this.services.scale.cubeToSquareSwapped) {
                    this.services.scale.setScaleCompleted(true);
                    console.log('✅ scaleCompleted восстановлен после задержки');
                }
            }, 800);
        }
    }
    
    /**
     * Получение состояния всех сервисов
     */
    getState() {
        return {
            cube: this.services.cube ? this.services.cube.getState() : null,
            video: this.services.video ? this.services.video.getState() : null,
            positioning: this.services.positioning ? this.services.positioning.getState() : null,
            scale: this.services.scale ? this.services.scale.getState() : null,
            text: this.services.text ? this.services.text.getState() : null,
            scrollProgress: this.lastScrollProgress,
            animationPhases: this.animationPhases
        };
    }
    
    /**
     * Обновление размеров viewport (при resize)
     */
    handleResize() {
        super.handleResize(); // Вызываем родительский метод
        
        if (this.services.positioning) {
            this.services.positioning.updateViewportSize();
        }
    }
    
    /**
     * Очистка ресурсов (переопределяем метод BaseComponent)
     */
    destroy() {
        // Уничтожаем все микросервисы через namespace
        if (this.services.cube) {
            this.services.cube.destroy();
            this.services.cube = null;
        }
        
        if (this.services.video) {
            this.services.video.destroy();
            this.services.video = null;
        }
        
        if (this.services.positioning) {
            this.services.positioning.destroy();
            this.services.positioning = null;
        }
        
        if (this.services.scale) {
            this.services.scale.destroy();
            this.services.scale = null;
        }
        
        if (this.services.text) {
            this.services.text.destroy();
            this.services.text = null;
        }
        
        // Очищаем весь namespace
        this.services = null;
        
        // Вызываем родительский метод очистки
        super.destroy();
        
        console.log('🎲 HeroCubeController destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.HeroCubeController = HeroCubeController;
}
