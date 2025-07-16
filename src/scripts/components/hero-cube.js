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
        this.playButton = element.querySelector('.hero-play-button');
        
        if (!this.cube || !this.cubeContainer || !this.square || !this.video || !this.playButton) {
            console.warn('Hero cube elements not found');
            return;
        }
        
        // Отслеживание скролла
        this.lastScrollY = window.scrollY;
        this.scrollVelocity = 0;
        this.currentRotation = { x: 0, y: 0 };
        
        // Отслеживание поворотов граней
        this.lastFaceAngle = 0; // Начальный угол (красная грань)
        this.currentFace = 'red'; // Текущая видимая грань
        this.faceHistory = []; // История смены граней
        
        // Определение граней по углам поворота (реальный порядок вращения)
        this.faceAngles = {
            '0': { name: 'red', color: '#ff6b6b', emoji: '❤️' },      // front (начальная)
            '90': { name: 'yellow', color: '#f9ca24', emoji: '💛' },  // left → front при вращении
            '180': { name: 'green', color: '#4ecdc4', emoji: '💚' },  // back → front при вращении
            '270': { name: 'blue', color: '#45b7d1', emoji: '💙' },   // right → front при вращении
            '360': { name: 'red', color: '#ff6b6b', emoji: '❤️' }     // Полный оборот
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
        
        // Throttling для защиты от слишком частых обновлений
        this.lastUpdate = 0;
        this.updateThrottle = 16; // ~60fps (1000ms / 60fps = 16.67ms)
        
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
        
        this.setupScrollTrigger();
        
        // Выводим начальную грань
        const initialFaceInfo = this.faceAngles['0'];
        // console.log('🎲 Hero 3D Cube initialized');
        // console.log(`🎲${initialFaceInfo.emoji} ${initialFaceInfo.name.toUpperCase()} ГРАНЬ ИЗНАЧАЛЬНО ВИДНА! (0°)`);
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
            this.lastSwitchTime = now;
        } else if (this.isAbsoluteMode && shouldBeFixed) {
            // console.log(`🎲 SWITCHING TO FIXED: diff=${diff}, timeSinceLastSwitch=${timeSinceLastSwitch}ms`);
            this.switchToFixedMode();
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
        
        // ✅ Используем настройки из единого места
        const { rotationEnd, scaleStart, backgroundStart } = this.animationPhases;
        
        // 🎯 ЛОГИКА УПРАВЛЕНИЯ ПЛАШКОЙ С УЧЕТОМ РАЗМЕРА ПРЯМОУГОЛЬНИКА И ПОЗИЦИИ СЕКЦИИ
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
            
            // ✅ НОВОЕ: Проверка позиции секции (нижняя граница секции >= нижней границы браузера)
            const isSectionVisible = heroRect.bottom >= window.innerHeight;
            
            // 📈 ПОКАЗ КНОПКИ: прямоугольник заполнен И секция видна
            if (isFullyFilled && isSectionVisible && !this.playButtonActivated) {
                this.showPlayButton();
                console.log(`🎬 Кнопка показана: прямоугольник заполнен (${realWidth}x${realHeight}) И секция видна (bottom: ${heroRect.bottom})`);
            }
            
            // 📉 СКРЫТИЕ КНОПКИ: прямоугольник не заполнен ИЛИ секция ушла вверх
            if ((!isFullyFilled || !isSectionVisible) && this.playButtonActivated) {
                this.hidePlayButton();
                const reason = !isFullyFilled ? 'прямоугольник не заполнен' : 'секция ушла вверх';
                console.log(`🔄 Кнопка скрыта: ${reason} (размер: ${realWidth}x${realHeight}, bottom: ${heroRect.bottom})`);
            }
        }
        
        // 🔄 ОБРАТНАЯ АНИМАЦИЯ: Проверка направления скролла для других элементов
        const isScrollingUp = scrollProgress < this.lastScrollProgress;
        
        // Обратная логика ТОЛЬКО при скролле ВВЕРХ (для видео и куба)
        if (isScrollingUp) {
            // Скрываем видео если скроллим выше точки показа
            if (scrollProgress < backgroundStart && this.videoShown) {
                this.hideVideo();
                // Деактивируем и скрываем play кнопку
                this.playButton.classList.remove('active');
                gsap.to(this.playButton, { opacity: 0, duration: 0.3 });
            }
            
            // Возвращаем квадрат в куб если скроллим выше точки масштабирования
            if (scrollProgress < scaleStart && this.cubeToSquareSwapped) {
                this.swapSquareToCube();
                this.isScalingMode = false;
                this.scaleCompleted = false;
                this.playButtonActivated = false; // Сбрасываем флаг активации плашки
                this.cubeContainer.classList.remove('scaling-mode');
                // Деактивируем и скрываем play кнопку при возврате к кубу
                this.playButton.classList.remove('active');
                gsap.to(this.playButton, { opacity: 0, duration: 0.3 });
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
            targetRotation = 360; // Куб застыл на красной грани
            
            // Проверяем завершение вращения
            if (!this.rotationComplete) {
                this.rotationComplete = true;
                console.log('🎲 Вращение завершено! Куб застыл на красной грани.');
                
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
        console.log(`🎨 === РЕСАЙЗ КАРТИНКИ (progress: ${(progress * 100).toFixed(1)}%) ===`);
        console.log(`📐 Viewport: ${window.innerWidth}×${window.innerHeight}px`);
        console.log(`🔢 Calculated scaleX: ${scaleX.toFixed(3)}, scaleY: ${scaleY.toFixed(3)}`);
        
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
        
        console.log(`🔧 Компенсация масштаба фона: inverseX=${inverseScaleX.toFixed(3)}, inverseY=${inverseScaleY.toFixed(3)}`);
        
        // Получаем реальные размеры квадрата ПОСЛЕ применения масштаба
        const realRect = this.square.getBoundingClientRect();
        const realWidth = realRect.width;
        const realHeight = realRect.height;
        
        // 🖼️ ЛОГИРОВАНИЕ РАЗМЕРОВ КАРТИНКИ
        console.log(`📏 Квадрат после масштаба: ${realWidth.toFixed(1)}×${realHeight.toFixed(1)}px`);
        
        // Проверяем состояние реального элемента фона
        if (this.squareBg) {
            const realBgSize = this.squareBg.style.backgroundSize;
            const realBgWidth = this.squareBg.style.width;
            const realBgHeight = this.squareBg.style.height;
            console.log(`🖼️ Реальный background-size элемента: ${realBgSize}`);
            console.log(`📦 Реальные размеры элемента фона: ${realBgWidth} × ${realBgHeight}`);
        } else {
            console.log(`⚠️ this.squareBg не найден! Элемент фона не инициализирован.`);
        }
        
        // Проверка заполнения viewport
        const isWidthCovered = realWidth >= window.innerWidth;
        const isHeightCovered = realHeight >= window.innerHeight;
        const isFullyFilled = isWidthCovered && isHeightCovered;
        
        console.log(`✅ Заполнение viewport: ширина ${isWidthCovered ? '✅' : '❌'}, высота ${isHeightCovered ? '✅' : '❌'}, полное ${isFullyFilled ? '✅' : '❌'}`);
        
        // 🖼️ ДИНАМИЧЕСКОЕ JAVASCRIPT УПРАВЛЕНИЕ РАЗМЕРОМ КАРТИНКИ
        if (this.squareBg) {
            const imageAspectRatio = 1.679; // Соотношение сторон картинки (5696×3392px)
            
            // ДИНАМИЧЕСКАЯ ЛОГИКА: выбираем контейнер в зависимости от заполнения viewport
            let containerWidth, containerHeight;
            if (isFullyFilled) {
                // Фаза 2: прямоугольник заполнил viewport → используем размер viewport
                containerWidth = window.innerWidth;
                containerHeight = window.innerHeight;
                console.log(`🔄 РЕЖИМ VIEWPORT: прямоугольник заполнил экран`);
            } else {
                // Фаза 1: прямоугольник растет → используем размер прямоугольника
                containerWidth = realWidth;
                containerHeight = realHeight;
                console.log(`🔄 РЕЖИМ ПРЯМОУГОЛЬНИКА: картинка растет вместе с прямоугольником`);
            }
            
            // Логика cover для выбранного контейнера
            let bgWidth, bgHeight;
            if (containerWidth / containerHeight > imageAspectRatio) {
                // Контейнер шире картинки - заполняем по ШИРИНЕ (cover эффект)
                bgWidth = containerWidth;  // Заполняем всю ширину контейнера
                bgHeight = containerWidth / imageAspectRatio;  // Высота пропорционально
            } else {
                // Контейнер выше картинки - заполняем по высоте
                bgHeight = containerHeight;
                bgWidth = containerHeight * imageAspectRatio;
            }
            
            // Применяем размеры к элементу фона
            this.squareBg.style.width = `${containerWidth}px`;
            this.squareBg.style.height = `${containerHeight}px`;
            this.squareBg.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
            
            console.log(`🖼️ ДИНАМИЧЕСКИЙ background-size: ${bgWidth.toFixed(1)}×${bgHeight.toFixed(1)}px`);
            console.log(`📦 ДИНАМИЧЕСКИЙ размер контейнера фона: ${containerWidth.toFixed(1)}×${containerHeight.toFixed(1)}px`);
            console.log(`🎯 Режим: ${isFullyFilled ? 'VIEWPORT' : 'ПРЯМОУГОЛЬНИК'}`);
        } else {
            console.warn('⚠️ Элемент фона не инициализирован!');
        }
        console.log(`🎨 === КОНЕЦ РЕСАЙЗА ===\n`);
        
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
                    width: 100vw;
                    height: 100vh;
                    transform: translate(-50%, -50%);
                    background: url('assets/images/liquid-pattern-17.jpg') center no-repeat;
                    background-size: cover;
                    z-index: -1;
                    image-rendering: auto;
                    image-rendering: -webkit-optimize-contrast;
                    transition: opacity 0.3s ease;
                `;
                this.square.appendChild(this.squareBg);
                console.log('✅ Элемент фона создан через JavaScript');
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
            // Fallback к фиксированной кнопке (для мобильных или если CursorPlayButton недоступен)
            console.log('📱 Fallback: показываем фиксированную play кнопку');
            
            // Активируем фиксированную кнопку
            this.playButton.classList.add('active');
            
            // Плавно показываем кнопку
            gsap.to(this.playButton, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });
            
            // Добавляем обработчик клика
            const clickHandler = () => {
                this.startVideo();
                this.playButton.removeEventListener('click', clickHandler);
            };
            
            this.playButton.addEventListener('click', clickHandler);
            
            console.log('✅ Фиксированная play кнопка активна (fallback)!');
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
        } else {
            // Fallback: скрываем фиксированную кнопку
            this.playButton.classList.remove('active');
            gsap.to(this.playButton, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
            console.log('✅ Фиксированная play кнопка скрыта (fallback).');
        }
        
        // Сбрасываем только флаг активации кнопки
        this.playButtonActivated = false;
        
        // НЕ сбрасываем videoShown - это позволяет кнопке появиться снова
        // videoShown сбрасывается только при полном сбросе (возврат к кубу)
        
        console.log('🔄 Магнитная play кнопка скрыта (готова к повторному показу)');
    }
    
    // Запуск видео по клику
    startVideo() {
        console.log('🎬 Запускаем видео по клику пользователя');
        
        // Скрываем play кнопку
        gsap.to(this.playButton, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
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
    
    // Уничтожение экземпляра
    destroy() {
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === this.element) {
                trigger.kill();
            }
        });
        
        console.log('🎲 Hero 3D Cube destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.HeroCube = HeroCube;
}
