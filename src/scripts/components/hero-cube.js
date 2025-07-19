// =============================================================================
// Hero 3D Cube Animation with GSAP
// =============================================================================

class HeroCube {
    constructor(element) {
        this.element = element;
        this.cube = element.querySelector('.hero-cube');
        this.cubeContainer = element.querySelector('.hero-cube-container');
        this.square = element.querySelector('.hero-square');
        this.video = element.querySelector('.hero-video');
        
        if (!this.cube || !this.cubeContainer || !this.square || !this.video) {
            console.warn('Hero cube elements not found');
            return;
        }
        
        // Отслеживание скролла
        this.lastScrollY = window.scrollY;
        this.scrollVelocity = 0;
        this.currentRotation = { x: 0, y: 0 };
        
        // Отслеживание поворотов граней
        this.lastFaceAngle = 0; // Начальный угол (фиолетовая грань)
        this.currentFace = 'purple'; // Текущая видимая грань
        this.faceHistory = []; // История смены граней
        
        // Определение граней по углам поворота (градиентные цвета из services)
        this.faceAngles = {
            '0': { name: 'purple', color: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', emoji: '💜' },      // front (фиолетово-индиго)
            '90': { name: 'green', color: 'linear-gradient(135deg, #34A853 0%, #FBBC04 100%)', emoji: '💚' },     // left → front (зелено-желтый)
            '180': { name: 'blue', color: 'linear-gradient(135deg, #1877F2 0%, #00BCD4 100%)', emoji: '💙' },     // back → front (сине-голубой)
            '270': { name: 'orange', color: 'linear-gradient(135deg, #EA4335 0%, #FF6D01 100%)', emoji: '🧡' },   // right → front (красно-оранжевый)
            '360': { name: 'purple', color: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', emoji: '💜' }    // Полный оборот
        };
        
        // Настройки анимации
        this.velocityMultiplier = 0.5; // Множитель скорости вращения
        this.maxVelocity = 10; // Максимальная скорость для предотвращения слишком быстрого вращения
        
        // Режимы позиционирования
        this.isAbsoluteMode = false;
        this.fixedCenterY = window.innerHeight / 2; // Центр экрана по Y
        this.transitionTween = null; // Текущая анимация перехода
        this.modeCheckTimeout = null; // Debounce для проверки режима
        this.lastModeCheck = 0; // Последняя проверка режима
        this.lastSwitchTime = 0; // Время последнего переключения режима
        
        // QuickSetters для лучшей производительности
        this.setX = null;
        this.setY = null;
        
        // Проверка поддержки reduced motion
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // ⭐ НАСТРОЙКИ ФАЗ АНИМАЦИИ (единое место управления)
        this.animationPhases = {
            rotationEnd: 0.15,       // 15% - конец вращения куба (ускорено)
            scaleStart: 0.25,        // 25% - начало масштабирования квадрата (раньше)
            backgroundStart: 0.45,   // 45% - начало красного фона (намного раньше!)
            
            // Дополнительные настройки
            swapDelay: 0.05,         // 5% - задержка подмены после вращения
            scaleOffset: 50          // 50px - отступ для начала масштабирования
        };
        
        // Новые свойства для эффекта масштабирования
        this.isScalingMode = false;
        this.rotationComplete = false;
        this.scaleCompleted = false; // Флаг завершения масштабирования
        this.cubeToSquareSwapped = false; // Флаг подмены куба на квадрат
        this.videoShown = false; // Флаг показа видео
        
        // Отслеживание направления скролла для обратной анимации
        this.lastScrollProgress = 0;
        
        // Флаг для управления магнитной плашкой
        this.playButtonActivated = false; // Отслеживание активации плашки
        
        // ✅ НОВОЕ: Флаг навигационного сброса для предотвращения автопоказа кнопки
        this.navigationReset = false; // Флаг сброса через навигацию
        this.navigationResetTime = 0; // Время установки navigationReset
        
        // Управление видимостью заголовков
        this.titleContainer = null;
        this.subtitleContainer = null;
        this.textHidden = false; // Флаг скрытия заголовков
        
        // Адаптивный throttling с использованием PerformanceConfig
        this.lastUpdate = 0;
        this.updateThrottle = 16; // Базовое значение ~60fps
        this.throttleOptimizationInterval = null;
        
        // Ссылка на элемент фона для прямого управления
        this.squareBg = null;
        
        this.init();
    }
    
    init() {
        if (this.prefersReducedMotion) {
            console.log('Reduced motion preference detected, cube animation disabled');
            return;
        }
        
        // Проверяем наличие GSAP и ScrollTrigger
        if (typeof gsap === 'undefined') {
            console.error('GSAP not found. Make sure GSAP is loaded before this script.');
            return;
        }
        
        if (typeof ScrollTrigger === 'undefined') {
            console.error('ScrollTrigger not found. Make sure ScrollTrigger is loaded before this script.');
            return;
        }
        
        // Инициализируем quickSetters для лучшей производительности
        this.setX = gsap.quickSetter(this.cubeContainer, "x", "px");
        this.setY = gsap.quickSetter(this.cubeContainer, "y", "px");
        
        // Инициализируем элементы заголовков
        this.initTextContainers();
        
        this.setupScrollTrigger();
        
        // Настройка адаптивной оптимизации throttling
        this.setupThrottleOptimization();
        
        // Выводим начальную грань
        const initialFaceInfo = this.faceAngles['0'];
        // console.log('🎲 Hero 3D Cube initialized');
        // console.log(`🎲${initialFaceInfo.emoji} ${initialFaceInfo.name.toUpperCase()} ГРАНЬ ИЗНАЧАЛЬНО ВИДНА! (0°)`);
    }
    
    // Инициализация элементов заголовков
    initTextContainers() {
        this.titleContainer = document.querySelector('.hero-title-container');
        this.subtitleContainer = document.querySelector('.hero-subtitle-container');
        
        if (this.titleContainer) {
            console.log('✅ Hero title container найден');
        } else {
            console.warn('⚠️ Hero title container не найден');
        }
        
        if (this.subtitleContainer) {
            console.log('✅ Hero subtitle container найден');
        } else {
            console.warn('⚠️ Hero subtitle container не найден');
        }
    }
    
    setupScrollTrigger() {
        ScrollTrigger.create({
            trigger: this.element,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
                this.checkPositioningMode();
                this.updateCubeRotation(self);
            }
        });
    }
    
    // Настройка адаптивной оптимизации throttling
    setupThrottleOptimization() {
        // Проверяем доступность PerformanceConfig
        if (typeof window.PerformanceConfig === 'undefined') {
            console.warn('⚠️ PerformanceConfig недоступен, используем статический throttling');
            return;
        }
        
        // Запускаем оптимизацию throttling каждые 3 секунды
        this.throttleOptimizationInterval = setInterval(() => {
            const optimizedThrottle = window.PerformanceConfig.optimizeThrottling(
                'HeroCube', 
                this.updateThrottle
            );
            
            // Обновляем throttling только если значение изменилось
            if (optimizedThrottle !== this.updateThrottle) {
                this.updateThrottle = optimizedThrottle;
                console.log(`🎲 HeroCube throttling обновлен: ${this.updateThrottle}ms`);
            }
        }, 3000);
        
        console.log('✅ Адаптивная оптимизация throttling для HeroCube настроена');
    }
    
    checkPositioningMode() {
        const heroRect = this.element.getBoundingClientRect();
        const diff = heroRect.bottom - window.innerHeight;
        const now = Date.now();
        const timeSinceLastSwitch = now - this.lastSwitchTime;
        
        // Адаптивные пороги переключения (процент от высоты экрана)
        const switchThreshold = window.innerHeight * 0.06; // 6% от высоты экрана
        const shouldBeAbsolute = heroRect.bottom <= window.innerHeight + switchThreshold;
        const shouldBeFixed = heroRect.bottom >= window.innerHeight + (switchThreshold * 2);
        
        
        // Предотвращаем частые переключения (минимум 200ms между переключениями)
        if (timeSinceLastSwitch < 200) {
            return;
        }
        
        // Уменьшенный гистерезис для предотвращения дрожания
        if (!this.isAbsoluteMode && shouldBeAbsolute) {
            // console.log(`🎲 SWITCHING TO ABSOLUTE: diff=${diff}, timeSinceLastSwitch=${timeSinceLastSwitch}ms`);
            this.switchToAbsoluteMode();
            this.updateTextContainersPositioning(true); // ✅ НОВОЕ: Обновляем позиционирование заголовков
            this.lastSwitchTime = now;
        } else if (this.isAbsoluteMode && shouldBeFixed) {
            // console.log(`🎲 SWITCHING TO FIXED: diff=${diff}, timeSinceLastSwitch=${timeSinceLastSwitch}ms`);
            this.switchToFixedMode();
            this.updateTextContainersPositioning(false); // ✅ НОВОЕ: Обновляем позиционирование заголовков
            this.lastSwitchTime = now;
        }
    }
    
    switchToFixedMode() {
        if (this.isAbsoluteMode) {
            // console.log('🎲 === SWITCHING TO FIXED MODE ===');
            
            // Останавливаем предыдущую анимацию если есть
            if (this.transitionTween) {
                this.transitionTween.kill();
                this.transitionTween = null;
            }
            
            // Очищаем CSS свойства absolute режима
            this.cubeContainer.style.top = '';
            this.cubeContainer.style.left = '';
            this.cubeContainer.classList.remove('absolute-mode');
            // console.log('🎲 CSS cleared: top and left removed');
            
            // Плавный переход в fixed режим для устранения микроскачка
            gsap.to(this.cubeContainer, {
                duration: 0.15,    // Быстрый, но плавный переход
                clearProps: "x,y", // Очищаем предыдущие x,y значения
                xPercent: -50,     // Правильный способ для -50% transform
                yPercent: -50,     // Правильный способ для -50% transform
                scale: 1,
                ease: "power2.out", // Плавное замедление
                overwrite: true
            });
            // console.log('🎲 GSAP animated to: xPercent=-50, yPercent=-50 (smooth transition)');
            
            // Проверяем финальное состояние
            const finalStyle = window.getComputedStyle(this.cubeContainer);
            // console.log(`🎲 Final computed: top=${finalStyle.top}, left=${finalStyle.left}, transform=${finalStyle.transform}`);
            
            this.isAbsoluteMode = false;
            // console.log('🎲 === FIXED MODE COMPLETE ===');
        }
    }
    
    switchToAbsoluteMode() {
        if (!this.isAbsoluteMode) {
            console.log('🎲 === SWITCHING TO ABSOLUTE MODE ===');
            
            // Останавливаем предыдущую анимацию если есть
            if (this.transitionTween) {
                this.transitionTween.kill();
                this.transitionTween = null;
            }
            
            // Получаем позицию hero секции
            const heroRect = this.element.getBoundingClientRect();
            console.log(`🎲 Hero rect: top=${heroRect.top}, bottom=${heroRect.bottom}, height=${heroRect.height}`);
            
            // Центр браузера в пикселях
            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;
            console.log(`🎲 Viewport center: X=${viewportCenterX}, Y=${viewportCenterY}`);
            
            // Позиция hero секции относительно viewport
            const heroTop = heroRect.top;
            const heroLeft = heroRect.left;
            console.log(`🎲 Hero position: top=${heroTop}, left=${heroLeft}`);
            
            // Рассчитываем позицию для центра БРАУЗЕРА (не секции!)
            const targetX = viewportCenterX - heroLeft;        // Центр браузера по X
            const targetY = viewportCenterY - heroTop;         // Центр браузера по Y
            console.log(`🎲 Target position: X=${targetX}, Y=${targetY} (browser center)`);
            
            // Переключаем на absolute режим
            this.cubeContainer.classList.add('absolute-mode');
            
            // Устанавливаем позицию через CSS
            this.cubeContainer.style.left = targetX + 'px';
            this.cubeContainer.style.top = targetY + 'px';
            console.log(`🎲 CSS set: left=${targetX}px, top=${targetY}px`);
            
            // Используем GSAP только для центрирования элемента
            gsap.set(this.cubeContainer, {
                clearProps: "x,y",  // Очищаем x,y чтобы не было двойного позиционирования
                xPercent: -50,      // Центрирование элемента по X
                yPercent: -50,      // Центрирование элемента по Y
                overwrite: true
            });
            console.log(`🎲 GSAP set: clearProps x,y, xPercent=-50, yPercent=-50`);
            
            // Проверяем финальное состояние
            const finalStyle = window.getComputedStyle(this.cubeContainer);
            console.log(`🎲 Final computed: top=${finalStyle.top}, left=${finalStyle.left}, transform=${finalStyle.transform}`);
            
            this.isAbsoluteMode = true;
            console.log('🎲 === ABSOLUTE MODE COMPLETE ===');
        }
    }
    
    updateCubeRotation(scrollTrigger) {
        // ⚡ Throttling для защиты от слишком частых обновлений при быстром скролле
        const now = Date.now();
        if (now - this.lastUpdate < this.updateThrottle) {
            return; // Пропускаем обновление если прошло меньше 16ms (~60fps)
        }
        this.lastUpdate = now;
        
        // Рассчитываем прогресс скролла через hero секцию
        const scrollProgress = this.calculateScrollProgress();
        
        // ✅ ИСПРАВЛЕНО: Комбинированная логика сброса navigationReset
        const isScrollingDown = scrollProgress > this.lastScrollProgress;
        if (isScrollingDown && this.navigationReset && scrollProgress > 0.2) {
            // Дополнительная проверка - прошло ли достаточно времени с момента навигации
            const timeSinceNavigation = Date.now() - this.navigationResetTime;
            if (timeSinceNavigation > 1000) { // 1 секунда
                this.navigationReset = false;
                console.log('🔄 DEBUG: navigationReset сброшен после задержки и значительного скролла (20%+, 1сек+)');
            } else {
                console.log(`🕐 DEBUG: navigationReset НЕ сброшен - недостаточно времени (${timeSinceNavigation}ms < 1000ms)`);
            }
        }
        
        // ✅ Используем настройки из единого места
        const { rotationEnd, scaleStart, backgroundStart } = this.animationPhases;
        
        // 🎯 ЛОГИКА УПРАВЛЕНИЯ ПЛАШКОЙ С УЧЕТОМ РАЗМЕРА ПРЯМОУГОЛЬНИКА, ПОЗИЦИИ СЕКЦИИ И ПРОГРЕССА СКРОЛЛА
        if (this.scaleCompleted && this.cubeToSquareSwapped) {
            // Получаем позицию hero секции
            const heroRect = this.element.getBoundingClientRect();
            
            // Получаем реальные размеры квадрата
            const realRect = this.square.getBoundingClientRect();
            const realWidth = realRect.width;
            const realHeight = realRect.height;
            
            // Проверка ПОЛНОГО заполнения viewport
            const isWidthFullyFilled = realWidth >= window.innerWidth;
            const isHeightFullyFilled = realHeight >= window.innerHeight;
            const isFullyFilled = isWidthFullyFilled && isHeightFullyFilled;
            
            // ✅ Проверка позиции секции (нижняя граница секции >= нижней границы браузера)
            const isSectionVisible = heroRect.bottom >= window.innerHeight;
            
            // ✅ НОВОЕ: Проверка прогресса скролла - кнопка должна появляться только при достижении backgroundStart
            const isProgressReached = scrollProgress >= backgroundStart;
            
        // 📈 ПОКАЗ КНОПКИ: прямоугольник заполнен И секция видна И достигнут нужный прогресс И НЕ навигационный сброс
        if (isFullyFilled && isSectionVisible && isProgressReached && !this.playButtonActivated && !this.navigationReset) {
            this.showPlayButton();
            console.log(`🎬 DEBUG: Кнопка показана - все условия выполнены (navigationReset: ${this.navigationReset})`);
        } else if (isFullyFilled && isSectionVisible && isProgressReached && !this.playButtonActivated && this.navigationReset) {
            console.log(`🧭 DEBUG: Кнопка НЕ показана из-за navigationReset = true (размер: ${realWidth}x${realHeight}, прогресс: ${(scrollProgress * 100).toFixed(1)}%)`);
        }
        
        // 📉 СКРЫТИЕ КНОПКИ: прямоугольник не заполнен ИЛИ секция ушла вверх ИЛИ прогресс недостаточен
        if ((!isFullyFilled || !isSectionVisible || !isProgressReached) && this.playButtonActivated) {
            this.hidePlayButton();
            const reason = !isFullyFilled ? 'прямоугольник не заполнен' : 
                          !isSectionVisible ? 'секция ушла вверх' : 'прогресс недостаточен';
            // console.log(`🔄 Кнопка скрыта: ${reason} (размер: ${realWidth}x${realHeight}, bottom: ${heroRect.bottom}, прогресс: ${(scrollProgress * 100).toFixed(1)}%)`);
        }
        }
        
        // ✅ НОВОЕ: Отслеживание выхода из hero-секции для полного сброса видео
        const heroRect = this.element.getBoundingClientRect();
        const isHeroVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
        
        // Если секция полностью вышла из viewport И видео активно
        if (!isHeroVisible && this.videoShown) {
            console.log('🎬 Hero секция вышла из viewport - полный сброс видео');
            this.resetVideoCompletely();
        }
        
        // 🔄 ОБРАТНАЯ АНИМАЦИЯ: Проверка направления скролла для других элементов
        const isScrollingUp = scrollProgress < this.lastScrollProgress;
        
        // Обратная логика ТОЛЬКО при скролле ВВЕРХ (для видео и куба)
        if (isScrollingUp) {
            // Скрываем видео если скроллим выше точки показа
            if (scrollProgress < backgroundStart && this.videoShown) {
                this.hideVideo();
            }
            
            // Возвращаем квадрат в куб если скроллим выше точки масштабирования
            if (scrollProgress < scaleStart && this.cubeToSquareSwapped) {
                this.swapSquareToCube();
                this.isScalingMode = false;
                this.scaleCompleted = false;
                this.playButtonActivated = false; // Сбрасываем флаг активации плашки
                this.cubeContainer.classList.remove('scaling-mode');
                console.log('🔄 Режим масштабирования отключен при обратном скролле');
            }
        }
        
        let targetRotation = 0;
        
        // Фаза 1: Вращение (0 - rotationEnd%)
        if (scrollProgress <= rotationEnd) {
            const rotationProgress = scrollProgress / rotationEnd; // 0-1 за фазу вращения
            targetRotation = rotationProgress * 360; // 0-360° за фазу вращения
            
            // Сбрасываем флаг завершения если скроллим назад
            if (this.rotationComplete && targetRotation < 360) {
                this.rotationComplete = false;
                console.log('🔄 Флаг завершения вращения сброшен при обратном скролле');
            }
        } else {
            // Фаза 2: Застывание (rotationEnd - scaleStart%)
            targetRotation = 360; // Куб застыл на фиолетовой грани
            
            // Проверяем завершение вращения
            if (!this.rotationComplete) {
                this.rotationComplete = true;
                console.log('🎲 Вращение завершено! Куб застыл на фиолетовой грани.');
                
                // Подмена куба на квадрат
                this.swapCubeToSquare();
            }
        }
        
        // Применяем вращение
        gsap.set(this.cube, {
            rotationY: targetRotation,
            rotationX: 0, // Всегда 0 - только горизонтальное вращение
            overwrite: true // Предотвращаем конфликты анимаций
        });
        
        // Фаза 3: Эффект масштабирования (scaleStart - 100%)
        if (scrollProgress >= scaleStart && this.rotationComplete) {
            this.handleScaleEffect();
        }
        
        // Отслеживание граней (только если не в режиме масштабирования)
        if (!this.isScalingMode) {
            this.trackFaceRotation(targetRotation);
        }
        
        // ✅ НОВОЕ: Управление видимостью заголовков
        this.updateTextVisibility(scrollProgress);
        
        // Сохраняем текущий прогресс для следующего кадра
        this.lastScrollProgress = scrollProgress;
    }
    
    // Обработка эффекта масштабирования после застывания куба
    handleScaleEffect() {
        const scrollProgress = this.calculateScrollProgress();
        
        // ✅ Используем настройки из единого места
        const { scaleStart, backgroundStart } = this.animationPhases;
        
        if (scrollProgress >= scaleStart) {
            if (!this.isScalingMode) {
                this.isScalingMode = true;
                this.cubeContainer.classList.add('scaling-mode');
                console.log('🔥 Начинается эффект масштабирования!');
            }
            
            // Определяем прогресс в зависимости от фазы
            let scaleProgress = 0;
            
            if (scrollProgress < backgroundStart) {
                // Фаза масштабирования (scaleStart - backgroundStart): квадрат увеличивается
                const scalePhaseProgress = (scrollProgress - scaleStart) / (backgroundStart - scaleStart);
                scaleProgress = Math.min(1, scalePhaseProgress);
            } else {
                // Фаза красного фона (backgroundStart - 100%): максимальный масштаб
                scaleProgress = 1;
            }
            
            this.applyScaleEffect(scaleProgress);
        }
    }
    
    // Применение эффекта масштабирования (теперь работает с 2D квадратом)
    applyScaleEffect(progress) {
        if (!this.cubeToSquareSwapped) {
            console.warn('⚠️ Квадрат не активен! Подмена не произошла.');
            return;
        }
        
        // 🛡️ Гарантируем полную непрозрачность квадрата
        // Проблема: overwrite: true может прервать анимацию opacity из swapCubeToSquare()
        const currentOpacity = parseFloat(window.getComputedStyle(this.square).opacity);
        if (currentOpacity < 1) {
            gsap.set(this.square, { opacity: 1 });
            console.log(`🔧 Исправлена прозрачность квадрата: ${currentOpacity} → 1`);
        }
        
        // 2D масштабирование квадрата для заполнения viewport
        let scaleX = 1 + (progress * ((window.innerWidth / 200) - 1));   // Масштаб по ширине
        let scaleY = 1 + (progress * ((window.innerHeight / 200) - 1));  // Масштаб по высоте
        
        // 🛡️ Плавная защита от неполного заполнения (без рывков)
        if (progress > 0.85) {
            const forceProgress = (progress - 0.85) / 0.15; // 0-1 от 85% до 100%
            const targetScaleX = window.innerWidth / 200;
            const targetScaleY = window.innerHeight / 200;
            
            // Плавная интерполяция к целевому масштабу
            const forceStrength = 0.2; // 20% силы принуждения
            scaleX = gsap.utils.interpolate(scaleX, targetScaleX, forceProgress * forceStrength);
            scaleY = gsap.utils.interpolate(scaleY, targetScaleY, forceProgress * forceStrength);
        }
        
        // Повышаем z-index для полного покрытия, но НЕ выше видео (z-index: 30)
        const zIndex = 20 + Math.floor(progress * 9); // От 20 до 29 (видео остается на 30)
        
        // 📊 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ РЕСАЙЗА КАРТИНКИ
        // console.log(`🎨 === РЕСАЙЗ КАРТИНКИ (progress: ${(progress * 100).toFixed(1)}%) ===`);
        // console.log(`📐 Viewport: ${window.innerWidth}×${window.innerHeight}px`);
        // console.log(`🔢 Calculated scaleX: ${scaleX.toFixed(3)}, scaleY: ${scaleY.toFixed(3)}`);
        
        // Рассчитываем обратные значения масштаба для компенсации в CSS
        const inverseScaleX = 1 / scaleX;
        const inverseScaleY = 1 / scaleY;
        
        // Устанавливаем CSS custom properties для компенсации масштабирования фона
        this.square.style.setProperty('--inverse-scale-x', inverseScaleX);
        this.square.style.setProperty('--inverse-scale-y', inverseScaleY);
        
        // Применяем 2D трансформацию к квадрату с принудительной opacity
        gsap.set(this.square, {
            scaleX: scaleX,
            scaleY: scaleY,
            zIndex: zIndex,
            opacity: 1,        // ✅ Принудительно устанавливаем полную непрозрачность
            overwrite: true
        });
        
        // console.log(`🔧 Компенсация масштаба фона: inverseX=${inverseScaleX.toFixed(3)}, inverseY=${inverseScaleY.toFixed(3)}`);
        
        // Получаем реальные размеры квадрата ПОСЛЕ применения масштаба
        const realRect = this.square.getBoundingClientRect();
        const realWidth = realRect.width;
        const realHeight = realRect.height;
        
        // 🖼️ ЛОГИРОВАНИЕ РАЗМЕРОВ КАРТИНКИ
        // console.log(`📏 Квадрат после масштаба: ${realWidth.toFixed(1)}×${realHeight.toFixed(1)}px`);
        
        // Проверяем состояние реального элемента фона
        if (this.squareBg) {
            const realBgSize = this.squareBg.style.backgroundSize;
            const realBgWidth = this.squareBg.style.width;
            const realBgHeight = this.squareBg.style.height;
            // console.log(`🖼️ Реальный background-size элемента: ${realBgSize}`);
            // console.log(`📦 Реальные размеры элемента фона: ${realBgWidth} × ${realBgHeight}`);
        } else {
            // console.log(`⚠️ this.squareBg не найден! Элемент фона не инициализирован.`);
        }
        
        // Проверка заполнения viewport
        const isWidthCovered = realWidth >= window.innerWidth;
        const isHeightCovered = realHeight >= window.innerHeight;
        const isFullyFilled = isWidthCovered && isHeightCovered;
        
        // console.log(`✅ Заполнение viewport: ширина ${isWidthCovered ? '✅' : '❌'}, высота ${isHeightCovered ? '✅' : '❌'}, полное ${isFullyFilled ? '✅' : '❌'}`);
        
        // 🎨 ГРАДИЕНТ АВТОМАТИЧЕСКИ МАСШТАБИРУЕТСЯ - никаких дополнительных расчетов не нужно
        // Фиолетовый градиент заполняет квадрат автоматически благодаря width: 100% и height: 100%
        if (this.squareBg) {
            // console.log(`💜 Фиолетовый градиент автоматически заполняет квадрат ${realWidth.toFixed(1)}×${realHeight.toFixed(1)}px`);
        }
        // console.log(` === КОНЕЦ РЕСАЙЗА ===\n`);
        
        // Останавливаем масштабирование когда viewport полностью заполнен
        if (isFullyFilled && !this.scaleCompleted) {
            this.scaleCompleted = true;
            console.log('🔴 Viewport полностью заполнен квадратом! Масштабирование остановлено.');
            
            // Логика показа кнопки теперь в основном цикле updateCubeRotation()
        }
        
        // 🛡️ Fallback: принудительное завершение масштабирования при высоком прогрессе
        if (progress >= 0.95 && !this.scaleCompleted) {
            console.log('🛡️ Fallback: принудительное завершение масштабирования при 95% прогресса');
            this.scaleCompleted = true;
            // Логика показа кнопки теперь в основном цикле updateCubeRotation()
        }
    }
    
    // Подмена 3D куба на 2D квадрат
    swapCubeToSquare() {
        if (this.cubeToSquareSwapped) return; // Уже подменен
        
        console.log('🔄 Подмена: 3D куб → 2D квадрат');
        
        // Инициализируем элемент фона при подмене
        this.initSquareBackground();
        
        // Плавно скрываем куб
        gsap.to(this.cube, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Плавно показываем квадрат
        gsap.to(this.square, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
            delay: 0.1 // Небольшая задержка для плавности
        });
        
        this.cubeToSquareSwapped = true;
        console.log('✅ Подмена завершена! Теперь работаем с 2D квадратом.');
    }
    
    // Инициализация элемента фона для прямого JavaScript управления
    initSquareBackground() {
        if (!this.squareBg) {
            this.squareBg = this.square.querySelector('.hero-square-bg');
            if (!this.squareBg) {
                // Создаем элемент если его нет в HTML
                this.squareBg = document.createElement('div');
                this.squareBg.className = 'hero-square-bg';
                this.squareBg.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100%;
                    height: 100%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #9C27B0 0%, #673AB7 100%);
                    z-index: -1;
                    will-change: transform;
                    backface-visibility: hidden;
                    transition: opacity 0.3s ease;
                `;
                this.square.appendChild(this.squareBg);
                console.log('✅ Элемент фиолетового градиента создан через JavaScript');
            } else {
                console.log('✅ Элемент фона найден в HTML');
            }
        }
    }
    
    // Показ магнитной play кнопки
    showPlayButton() {
        if (this.playButtonActivated) return; // Кнопка уже активна
        
        console.log('🎬 Активируем магнитную play кнопку (красный фон заполнил viewport)');
        
        // Проверяем доступность CursorPlayButton
        if (window.cursorPlayButton) {
            // Активируем магнитную кнопку с callback для запуска видео
            window.cursorPlayButton.activate(() => {
                this.startVideo();
            });
            
            // Устанавливаем флаг активации плашки
            this.playButtonActivated = true;
            
            console.log('✅ Магнитная play кнопка активна! Следует за курсором.');
        } else {
            // Fallback: на мобильных или если CursorPlayButton недоступен - сразу запускаем видео
            console.log('📱 Fallback: CursorPlayButton недоступен, активируем видео напрямую');
            this.startVideo();
        }
    }
    
    // Скрытие магнитной play кнопки (без сброса videoShown)
    hidePlayButton() {
        if (!this.playButtonActivated) return; // Кнопка уже скрыта
        
        console.log('🔄 Скрываем магнитную play кнопку (гистерезис)');
        
        // Проверяем доступность CursorPlayButton
        if (window.cursorPlayButton) {
            // Деактивируем магнитную кнопку
            window.cursorPlayButton.deactivate();
            console.log('✅ Магнитная play кнопка деактивирована.');
        }
        
        // Сбрасываем флаг активации кнопки
        this.playButtonActivated = false;
        
        // ✅ НОВОЕ: Дополнительная защита - временно сбрасываем scaleCompleted
        const originalScaleCompleted = this.scaleCompleted;
        this.scaleCompleted = false;
        
        // Восстанавливаем через задержку для предотвращения мгновенной реактивации
        setTimeout(() => {
            // Проверяем, что состояние все еще актуально
            if (!this.playButtonActivated && originalScaleCompleted) {
                this.scaleCompleted = originalScaleCompleted;
                console.log('🔄 scaleCompleted восстановлен после защитной задержки');
            }
        }, 500);
        
        // НЕ сбрасываем videoShown - это позволяет кнопке появиться снова
        // videoShown сбрасывается только при полном сбросе (возврат к кубу)
        
        console.log('🔄 Магнитная play кнопка скрыта (готова к повторному показу)');
    }
    
    // Запуск видео по клику
    startVideo() {
        console.log('🎬 Запускаем видео по клику пользователя');
        
        // Деактивируем магнитную кнопку
        if (window.cursorPlayButton && window.cursorPlayButton.isActivated()) {
            window.cursorPlayButton.deactivate();
        }
        
        // ✅ НОВОЕ: Устанавливаем полноэкранные размеры через JavaScript
        if (this.video) {
            this.video.style.width = '100vw';
            this.video.style.height = 'auto';
            this.video.style.visibility = 'visible';
            this.video.style.pointerEvents = 'auto';
            
            console.log('🎬 Видео подготовлено: размеры установлены (100vw x auto), интерактивность включена');
        }
        
        // Плавно показываем видео
        gsap.to(this.video, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                // Запускаем видео (теперь по клику - браузер не блокирует)
                this.video.play().then(() => {
                    console.log('▶️ Видео запущено по клику пользователя');
                }).catch(error => {
                    console.error('❌ Ошибка запуска видео:', error);
                });
            }
        });
        
        this.videoShown = true;
        console.log('✅ Видео запущено! Контролы доступны пользователю.');
    }
    
    // Скрытие видео при обратном скролле
    hideVideo() {
        if (!this.videoShown) return; // Уже скрыто
        
        console.log('🎬 Скрываем видео при обратном скролле');
        
        // Останавливаем воспроизведение
        this.video.pause();
        
        // Плавно скрываем видео
        gsap.to(this.video, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        });
        
        // Деактивируем магнитную кнопку
        if (window.cursorPlayButton) {
            window.cursorPlayButton.deactivate();
            console.log('🎬 Магнитная play кнопка деактивирована');
        }
        
        // ✅ ПОЛНЫЙ СБРОС всех связанных флагов
        this.videoShown = false;
        this.scaleCompleted = false; // Позволяет повторно показать play кнопку
        
        console.log('✅ Видео скрыто и остановлено. Флаги сброшены для повторного использования.');
    }
    
    // Обратная подмена: 2D квадрат → 3D куб
    swapSquareToCube() {
        if (!this.cubeToSquareSwapped) return; // Уже куб
        
        console.log('🔄 Обратная подмена: 2D квадрат → 3D куб');
        
        // ✅ СБРАСЫВАЕМ масштабирование квадрата к исходному состоянию
        gsap.set(this.square, {
            scaleX: 1,     // Возвращаем к исходному размеру
            scaleY: 1,     // Возвращаем к исходному размеру
            zIndex: 20,    // Возвращаем к базовому z-index
            overwrite: true
        });
        
        // Плавно скрываем квадрат
        gsap.to(this.square, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Плавно показываем куб
        gsap.to(this.cube, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
            delay: 0.1 // Небольшая задержка для плавности
        });
        
        this.cubeToSquareSwapped = false;
        console.log('✅ Обратная подмена завершена! Квадрат сброшен к исходному состоянию. Теперь работаем с 3D кубом.');
    }
    
    // Скрытие боковых граней при масштабировании
    hideSideFaces(progress) {
        const faces = this.cube.querySelectorAll('.cube-face');
        faces.forEach(face => {
            if (!face.classList.contains('cube-face--front')) {
                // Постепенно скрываем все грани кроме передней (красной)
                face.style.opacity = Math.max(0, 1 - (progress * 2));
            }
        });
    }
    
    // Отслеживание поворотов граней куба
    trackFaceRotation(currentRotation) {
        // Нормализуем угол к диапазону 0-360 для удобства определения граней
        const normalizedAngle = ((currentRotation % 360) + 360) % 360;
        
        // Определяем ближайшую грань (каждые 90 градусов)
        let closestFaceAngle;
        let minDistance = Infinity;
        
        // Проверяем все возможные углы граней (синхронизировано с faceAngles)
        const faceAngles = [0, 90, 180, 270, 360];
        
        for (const angle of faceAngles) {
            const normalizedFaceAngle = ((angle % 360) + 360) % 360;
            const distance = Math.abs(normalizedAngle - normalizedFaceAngle);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestFaceAngle = angle;
            }
        }
        
        // Проверяем, достаточно ли близко к грани (в пределах 10 градусов)
        if (minDistance <= 10) {
            const faceKey = closestFaceAngle.toString();
            const faceInfo = this.faceAngles[faceKey];
            
            if (faceInfo && this.currentFace !== faceInfo.name) {
                // Смена грани!
                const previousFace = this.currentFace;
                this.currentFace = faceInfo.name;
                
                // Сохраняем в историю
                this.faceHistory.push({
                    face: faceInfo.name,
                    angle: closestFaceAngle,
                    timestamp: Date.now(),
                    previousFace: previousFace
                });
                
                // Выводим сообщение в консоль
                console.log(`🎲${faceInfo.emoji} ${faceInfo.name.toUpperCase()} ГРАНЬ ПОЛНОСТЬЮ ВИДНА! (${closestFaceAngle}°)`);
                
                // Дополнительная информация
                if (this.faceHistory.length > 1) {
                    console.log(`🔄 Переход: ${previousFace} → ${faceInfo.name}`);
                }
                
                // Специальные сообщения для полных оборотов
                if (faceInfo.name === 'red' && closestFaceAngle === 360 && this.faceHistory.length > 1) {
                    const redCount = this.faceHistory.filter(h => h.face === 'red').length;
                    console.log(`🎉 ПОЛНЫЙ ОБОРОТ #${redCount - 1} ЗАВЕРШЕН!`);
                }
            }
        }
    }
    
    // ✅ НОВОЕ: Управление позиционированием заголовков (fixed/absolute)
    updateTextContainersPositioning(shouldBeAbsolute) {
        if (!this.titleContainer && !this.subtitleContainer) return; // Нет элементов для управления
        
        if (shouldBeAbsolute) {
            // Переключаем на absolute режим - заголовки движутся вместе с секцией
            if (this.titleContainer) {
                this.titleContainer.classList.add('absolute-mode');
            }
            if (this.subtitleContainer) {
                this.subtitleContainer.classList.add('absolute-mode');
            }
            console.log('📝 Заголовки переключены в absolute режим - движутся вместе с секцией');
        } else {
            // Переключаем на fixed режим - заголовки зафиксированы на экране
            if (this.titleContainer) {
                this.titleContainer.classList.remove('absolute-mode');
            }
            if (this.subtitleContainer) {
                this.subtitleContainer.classList.remove('absolute-mode');
            }
            console.log('📝 Заголовки переключены в fixed режим - зафиксированы на экране');
        }
    }
    
    // ✅ НОВОЕ: Управление видимостью заголовков
    updateTextVisibility(scrollProgress) {
        if (!this.titleContainer && !this.subtitleContainer) return; // Нет элементов для управления
        
        // Получаем позицию hero секции
        const heroRect = this.element.getBoundingClientRect();
        const isSectionVisible = heroRect.bottom >= window.innerHeight;
        
        // Получаем реальные размеры квадрата (если он активен)
        let isFullyFilled = false;
        if (this.cubeToSquareSwapped && this.square) {
            const realRect = this.square.getBoundingClientRect();
            const realWidth = realRect.width;
            const realHeight = realRect.height;
            
            const isWidthFullyFilled = realWidth >= window.innerWidth;
            const isHeightFullyFilled = realHeight >= window.innerHeight;
            isFullyFilled = isWidthFullyFilled && isHeightFullyFilled;
        }
        
        // Используем настройки из единого места
        const { backgroundStart } = this.animationPhases;
        const isProgressReached = scrollProgress >= backgroundStart;
        
        // 📝 ЛОГИКА СКРЫТИЯ ЗАГОЛОВКОВ: такая же как у магнитной кнопки
        const shouldHideText = this.scaleCompleted && 
                              this.cubeToSquareSwapped && 
                              isFullyFilled && 
                              isSectionVisible && 
                              isProgressReached;
        
        // 📈 СКРЫТИЕ ЗАГОЛОВКОВ: когда квадрат заполняет экран
        if (shouldHideText && !this.textHidden) {
            this.hideTextContainers();
        }
        
        // 📉 ПОКАЗ ЗАГОЛОВКОВ: когда условия не выполнены
        if (!shouldHideText && this.textHidden) {
            this.showTextContainers();
        }
    }
    
    // Скрытие заголовков
    hideTextContainers() {
        if (this.textHidden) return; // Уже скрыты
        
        console.log('📝 Скрываем заголовки hero секции');
        
        // Плавно скрываем title container
        if (this.titleContainer) {
            gsap.to(this.titleContainer, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        }
        
        // Плавно скрываем subtitle container
        if (this.subtitleContainer) {
            gsap.to(this.subtitleContainer, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        }
        
        this.textHidden = true;
        console.log('✅ Заголовки hero секции скрыты');
    }
    
    // Показ заголовков
    showTextContainers() {
        if (!this.textHidden) return; // Уже показаны
        
        console.log('📝 Показываем заголовки hero секции');
        
        // Плавно показываем title container
        if (this.titleContainer) {
            gsap.to(this.titleContainer, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        }
        
        // Плавно показываем subtitle container
        if (this.subtitleContainer) {
            gsap.to(this.subtitleContainer, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        }
        
        this.textHidden = false;
        console.log('✅ Заголовки hero секции показаны');
    }
    
    // Рассчитываем прогресс скролла через hero секцию (0 = начало, 1 = конец)
    calculateScrollProgress() {
        const heroRect = this.element.getBoundingClientRect();
        
        // Простая логика: прогресс основан на том, насколько секция ушла вверх
        // 0% = секция полностью видна (top = 0)
        // 100% = секция полностью ушла (top = -height)
        const progress = Math.max(0, -heroRect.top / heroRect.height);
        
        // Ограничиваем от 0 до 1
        return Math.min(1, progress);
    }
    
    // Метод для программного управления кубом (если понадобится)
    rotateTo(x, y, duration = 1) {
        if (this.prefersReducedMotion) return;
        
        this.currentRotation.x = x;
        this.currentRotation.y = y;
        
        gsap.to(this.cube, {
            rotationX: x,
            rotationY: y,
            duration: duration,
            ease: "power2.out"
        });
    }
    
    // Сброс куба в исходное положение
    reset(duration = 1) {
        if (this.prefersReducedMotion) return;
        
        this.currentRotation.x = 0;
        this.currentRotation.y = 0;
        
        gsap.to(this.cube, {
            rotationX: 0,
            rotationY: 0,
            duration: duration,
            ease: "power2.out"
        });
    }
    
    // ✅ НОВЫЙ МЕТОД: Полный сброс видео к исходному состоянию
    resetVideoCompletely() {
        if (!this.videoShown) return; // Уже сброшено
        
        console.log('🎬 Полный сброс видео к исходному состоянию');
        
        // Останавливаем воспроизведение и сбрасываем к началу
        if (this.video) {
            this.video.pause();
            this.video.currentTime = 0; // Сброс к началу видео
            
            // ✅ НОВОЕ: Сбрасываем к минимальным размерам (не блокируем интерфейс)
            this.video.style.width = '0';
            this.video.style.height = '0';
            this.video.style.visibility = 'hidden';
            this.video.style.pointerEvents = 'none';
            this.video.style.opacity = '0';
            
            console.log('🎬 Видео сброшено к начальному состоянию (0x0px, скрыто, неинтерактивно)');
        }
        
        // Деактивируем магнитную кнопку
        if (window.cursorPlayButton && window.cursorPlayButton.isActivated()) {
            window.cursorPlayButton.deactivate();
        }
        
        // Полный сброс всех флагов
        this.videoShown = false;
        this.playButtonActivated = false;
        this.scaleCompleted = false;
        
        console.log('✅ Видео полностью сброшено к исходному состоянию');
    }
    
    // Сброс состояния видео при мгновенном скролле (для scroll-to-top кнопки)
    resetVideoState(fromNavigation = false) {
        console.log(`🔄 Сброс состояния видео ${fromNavigation ? 'через НАВИГАЦИЮ' : 'при мгновенном скролле'}`);
        
        // ✅ НОВОЕ: Запоминаем, что сброс произошел через навигацию
        if (fromNavigation) {
            this.navigationReset = true;
            this.navigationResetTime = Date.now(); // ✅ Запоминаем время установки флага
            console.log('🧭 DEBUG: Установлен флаг navigationReset = true - кнопка НЕ должна восстанавливаться автоматически');
            
            // ✅ ДОПОЛНИТЕЛЬНАЯ ЗАЩИТА: Таймер сброса на случай если пользователь не скроллит
            setTimeout(() => {
                if (this.navigationReset) {
                    this.navigationReset = false;
                    console.log('🕐 DEBUG: navigationReset сброшен по таймеру (2 сек) - защита от зависания');
                }
            }, 2000);
        }
        
        // Используем новый метод полного сброса
        this.resetVideoCompletely();
        
        // ✅ НОВОЕ: Не восстанавливаем scaleCompleted при навигационном сбросе
        if (!fromNavigation) {
            console.log('📈 DEBUG: Обычный сброс - планируем восстановление scaleCompleted через 800ms');
            setTimeout(() => {
                // Проверяем текущий прогресс скролла
                const scrollProgress = this.calculateScrollProgress();
                const { backgroundStart } = this.animationPhases;
                
                console.log(`📊 DEBUG: Проверка восстановления scaleCompleted: scrollProgress=${(scrollProgress * 100).toFixed(1)}%, backgroundStart=${(backgroundStart * 100).toFixed(1)}%, cubeToSquareSwapped=${this.cubeToSquareSwapped}`);
                
                // Восстанавливаем scaleCompleted только если мы все еще в зоне масштабирования
                if (scrollProgress >= backgroundStart && this.cubeToSquareSwapped) {
                    this.scaleCompleted = true;
                    console.log('✅ scaleCompleted восстановлен после увеличенной задержки');
                } else {
                    console.log('❌ scaleCompleted НЕ восстановлен - условия не выполнены');
                }
            }, 800);
        } else {
            console.log('🧭 DEBUG: Навигационный сброс - scaleCompleted НЕ будет восстанавливаться автоматически');
        }
        
        console.log(`✅ Состояние видео сброшено (navigationReset: ${this.navigationReset})`);
    }
    
    // Уничтожение экземпляра
    destroy() {
        // Очищаем ScrollTrigger
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === this.element) {
                trigger.kill();
            }
        });
        
        // Очищаем интервал оптимизации throttling
        if (this.throttleOptimizationInterval) {
            clearInterval(this.throttleOptimizationInterval);
            this.throttleOptimizationInterval = null;
            console.log('🧹 Throttle optimization interval очищен');
        }
        
        console.log('🎲 Hero 3D Cube destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.HeroCube = HeroCube;
}
