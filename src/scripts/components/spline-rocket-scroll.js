// =============================================================================
// Spline Rocket Scroll Animation Component
// =============================================================================

/**
 * Компонент для анимации 3D ракеты из Spline по скроллу сайта
 * Интегрируется с существующей архитектурой AnimatedInteractiveComponent
 */

class SplineRocketScroll extends AnimatedInteractiveComponent {
    constructor(element) {
        super(element, {
            debug: true,
            splineScene: '/src/assets/scenes/rocket/scene.splinecode',
            splineRuntime: '/src/assets/scenes/rocket/runtime.js',
            rocketName: 'Rocket', // Имя объекта в Spline сцене
            trajectoryPoints: 8,  // Количество точек траектории
            animationDuration: 1, // Плавность анимации
            throttleDelay: 16,    // ~60fps для обновлений позиции
            enableOnMobile: false, // Отключаем на мобильных для производительности
            respectReducedMotion: true
        });
        
        // Состояние компонента
        this.splineApp = null;
        this.rocket = null;
        this.canvas = null;
        this.isLoaded = false;
        this.currentProgress = 0;
        this.lastUpdate = 0;
        
        // Флаги состояния
        this.isMobile = window.innerWidth <= 768;
        this.shouldAnimate = true;
        
        // НЕ вызываем checkAnimationConditions() здесь!
        // Это будет сделано в beforeInit() после super.beforeInit()
    }
    
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get requiredDependencies() {
        return [...super.requiredDependencies]; // Spline будет загружен динамически
    }
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Специфичные настройки для Spline ракеты
            splineScene: '',
            rocketName: 'Rocket',
            trajectoryPoints: 8,
            enableOnMobile: false,
            respectReducedMotion: true
        };
    }
    
    // =============================================================================
    // Lifecycle методы
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // ТЕПЕРЬ проверяем условия для анимации (после super.beforeInit())
        this.checkAnimationConditions();
        
        // Добавляем детальное логирование для диагностики
        console.log('🔍 Animation conditions check:', {
            isMobile: this.isMobile,
            reducedMotion: this.reducedMotion,
            enableOnMobile: this.options.enableOnMobile,
            respectReducedMotion: this.options.respectReducedMotion,
            shouldAnimate: this.shouldAnimate,
            windowWidth: window.innerWidth
        });
        
        // Проверяем условия для инициализации
        if (!this.shouldAnimate) {
            console.log('🚀 Spline rocket animation disabled (mobile/reduced motion)');
            return;
        }
        
        console.log('🚀 SplineRocketScroll beforeInit - preparing 3D rocket');
    }
    
    async setupElements() {
        // =============================================================================
        // 🚨 КРИТИЧЕСКАЯ ПРОБЛЕМА И РЕШЕНИЕ: Race Condition в Async/Await
        // =============================================================================
        // 
        // ПРОБЛЕМА:
        // В асинхронном коде с requestAnimationFrame происходит race condition,
        // при котором this.canvas становится null после создания и добавления в DOM.
        // 
        // СИМПТОМЫ:
        // - Canvas создается успешно: this.canvas = <canvas>
        // - Добавляется в DOM: element.appendChild(this.canvas)
        // - Но в requestAnimationFrame callback: this.canvas = null
        // - При этом canvasRef (сохраненная ссылка) остается валидной
        // 
        // ПРИЧИНА:
        // Асинхронные операции (await + requestAnimationFrame) могут приводить к
        // потере контекста или перезаписи свойств объекта в сложных наследованиях.
        // Возможно, базовые классы или другой асинхронный код влияют на this.canvas.
        // 
        // РЕШЕНИЕ:
        // 1. Сохраняем ссылку на canvas ДО асинхронных операций
        // 2. Используем сохраненную ссылку для проверок и операций
        // 3. Восстанавливаем this.canvas из сохраненной ссылки при необходимости
        // 
        // ПРИМЕНИМОСТЬ:
        // Используйте этот паттерн когда:
        // - Работаете с DOM элементами в асинхронном коде
        // - Есть сложная иерархия наследования классов
        // - Свойства объекта могут изменяться в async/await блоках
        // =============================================================================
        
        console.log('🔍 setupElements START - this.canvas:', this.canvas);
        console.log('🔍 setupElements START - this context:', this);
        console.log('🔍 setupElements START - this.constructor.name:', this.constructor.name);
        
        super.setupElements();
        console.log('🔍 After super.setupElements() - this.canvas:', this.canvas);
        console.log('🔍 After super.setupElements() - this context:', this);
        
        // Если анимация отключена, не создаем элементы
        if (!this.shouldAnimate) {
            console.log('🔍 Animation disabled, returning false');
            return false;
        }
        
        console.log('🔍 Creating canvas element...');
        console.log('🔍 Before canvas creation - this.canvas:', this.canvas);
        
        // Создаем canvas для Spline
        this.canvas = document.createElement('canvas');
        console.log('🔍 Canvas created - this.canvas:', this.canvas);
        console.log('🔍 Canvas created - this context:', this);
        
        this.canvas.id = 'spline-rocket-canvas';
        this.canvas.className = 'spline-canvas';
        console.log('🔍 Canvas ID/class set - this.canvas:', this.canvas);
        
        // Устанавливаем размеры canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log('🔍 Canvas configured - this.canvas:', this.canvas);
        console.log('🔍 Canvas configured - this context:', this);
        
        // Добавляем в DOM
        this.element.appendChild(this.canvas);
        console.log('🔍 Canvas appended to DOM - this.canvas:', this.canvas);
        console.log('🔍 Canvas appended to DOM - this context:', this);
        
        // КРИТИЧЕСКИ ВАЖНО: Ждем несколько кадров для полной стабилизации DOM
        console.log('🔍 Waiting for DOM stabilization...');
        console.log('🔍 Before RAF - this.canvas:', this.canvas);
        console.log('🔍 Before RAF - this context:', this);
        
        // =============================================================================
        // 🛠️ РЕШЕНИЕ RACE CONDITION: Сохранение ссылок перед асинхронными операциями
        // =============================================================================
        // 
        // ТЕХНИКА:
        // Сохраняем ссылки на критически важные объекты ДО входа в асинхронный код.
        // Это защищает от потери данных в случае race conditions или перезаписи свойств.
        // 
        // ВАЖНО:
        // - canvasRef: Прямая ссылка на DOM элемент (остается валидной)
        // - thisRef: Ссылка на контекст объекта (для сравнения и отладки)
        // - Сохраняем ДО любых await операций
        // =============================================================================
        
        const canvasRef = this.canvas;  // Сохраняем ссылку на canvas
        const thisRef = this;           // Сохраняем ссылку на контекст
        
        console.log('🔍 Saved references - canvasRef:', canvasRef);
        console.log('🔍 Saved references - thisRef:', thisRef);
        console.log('🔍 Saved references - thisRef.canvas:', thisRef.canvas);
        
        await new Promise(resolve => requestAnimationFrame(() => {
            console.log('🔍 First RAF START - canvasRef:', canvasRef);
            console.log('🔍 First RAF START - this.canvas:', this.canvas);
            console.log('🔍 First RAF START - thisRef.canvas:', thisRef.canvas);
            console.log('🔍 First RAF START - this context:', this);
            console.log('🔍 First RAF START - thisRef context:', thisRef);
            console.log('🔍 First RAF START - this === thisRef:', this === thisRef);
            resolve();
        }));
        
        console.log('🔍 Between RAF - this.canvas:', this.canvas);
        console.log('🔍 Between RAF - canvasRef:', canvasRef);
        console.log('🔍 Between RAF - thisRef.canvas:', thisRef.canvas);
        
        await new Promise(resolve => requestAnimationFrame(() => {
            console.log('🔍 Second RAF START - canvasRef:', canvasRef);
            console.log('🔍 Second RAF START - this.canvas:', this.canvas);
            console.log('🔍 Second RAF START - thisRef.canvas:', thisRef.canvas);
            console.log('🔍 Second RAF START - this context:', this);
            console.log('🔍 Second RAF START - thisRef context:', thisRef);
            console.log('🔍 Second RAF START - this === thisRef:', this === thisRef);
            resolve();
        }));
        
        console.log('🔍 After RAF - this.canvas:', this.canvas);
        console.log('🔍 After RAF - canvasRef:', canvasRef);
        console.log('🔍 After RAF - thisRef.canvas:', thisRef.canvas);
        console.log('🔍 After RAF - this context:', this);
        
        console.log('🔍 About to check canvas - this.canvas:', this.canvas);
        console.log('🔍 About to check canvas - canvasRef:', canvasRef);
        console.log('🔍 About to check canvas - thisRef.canvas:', thisRef.canvas);
        
        // =============================================================================
        // 🔧 ВОССТАНОВЛЕНИЕ ПОСЛЕ RACE CONDITION: Проверка и восстановление ссылок
        // =============================================================================
        // 
        // ЛОГИКА ВОССТАНОВЛЕНИЯ:
        // 1. Проверяем сохраненную ссылку (canvasRef) - она должна быть валидной
        // 2. Если this.canvas стал null, но canvasRef есть - восстанавливаем
        // 3. Используем canvasRef как источник истины для проверок
        // 
        // ПОЧЕМУ ЭТО РАБОТАЕТ:
        // - canvasRef создается ДО асинхронных операций и остается валидной
        // - this.canvas может быть перезаписана в race condition
        // - Восстановление позволяет продолжить работу с правильным элементом
        // 
        // АЛЬТЕРНАТИВЫ:
        // - Использовать только canvasRef во всем коде (но нарушает архитектуру)
        // - Избегать requestAnimationFrame (но нужен для DOM стабилизации)
        // - Использовать setTimeout вместо RAF (менее точно)
        // =============================================================================
        
        // Проверяем сохраненную ссылку (источник истины)
        if (!canvasRef) {
            console.error('❌ CanvasRef is null after creation and DOM operations!');
            throw new Error('Canvas reference is null');
        }
        
        // Восстанавливаем this.canvas из сохраненной ссылки при необходимости
        if (!this.canvas && canvasRef) {
            console.log('🔧 Restoring this.canvas from canvasRef');
            this.canvas = canvasRef;
        }
        
        // Современная надежная проверка подключения к DOM
        if (!this.canvas) {
            console.error('❌ Canvas is null after creation and DOM operations!');
            console.error('❌ Debug info:', {
                thisContext: this,
                canvasProperty: this.canvas,
                canvasRef: canvasRef,
                thisRefCanvas: thisRef.canvas,
                elementProperty: this.element,
                shouldAnimate: this.shouldAnimate
            });
            throw new Error('Canvas element is null');
        }
        
        // Проверяем подключение к документу (современный стандарт)
        if (!this.canvas.isConnected) {
            console.warn('⚠️ Canvas not yet connected via isConnected, trying fallback check...');
            
            // Fallback: проверяем через contains()
            if (!this.element || !this.element.contains(this.canvas)) {
                console.error('❌ Canvas validation failed:', {
                    canvas: this.canvas,
                    element: this.element,
                    canvasIsConnected: this.canvas.isConnected,
                    elementContainsCanvas: this.element ? this.element.contains(this.canvas) : false,
                    canvasParentNode: this.canvas.parentNode,
                    elementInDOM: this.element ? this.element.isConnected : false
                });
                throw new Error('Canvas failed to initialize in DOM - not connected and not contained');
            }
            
            console.log('✅ Canvas validation passed via fallback (contains check)');
        } else {
            console.log('✅ Canvas validation passed via isConnected');
        }
        
        console.log('🎯 Canvas created and added to DOM:', {
            canvas: this.canvas,
            isConnected: this.canvas.isConnected,
            parentNode: this.canvas.parentNode,
            parentNodeTag: this.canvas.parentNode?.tagName,
            width: this.canvas.width,
            height: this.canvas.height,
            elementIsConnected: this.element.isConnected
        });
        
        // Загружаем Spline сцену
        await this.loadSplineScene();
        
        // =============================================================================
        // 📚 ВЫВОДЫ И РЕКОМЕНДАЦИИ: Уроки из решения Race Condition
        // =============================================================================
        // 
        // ✅ ЧТО СРАБОТАЛО:
        // - Сохранение ссылок ДО асинхронных операций
        // - Использование canvasRef как источника истины
        // - Восстановление this.canvas из сохраненной ссылки
        // - Детальное логирование для диагностики
        // 
        // 🔍 КАК ДИАГНОСТИРОВАТЬ ПОДОБНЫЕ ПРОБЛЕМЫ:
        // - Добавить логирование на каждом этапе асинхронного кода
        // - Сравнить this.property с сохраненными ссылками
        // - Проверить this === savedThisRef для контекста
        // - Использовать console.trace() для отслеживания стека вызовов
        // 
        // 🛠️ КОГДА ПРИМЕНЯТЬ ЭТУ ТЕХНИКУ:
        // - Сложные иерархии наследования классов
        // - Асинхронный код с DOM элементами
        // - requestAnimationFrame + await комбинации
        // - Когда свойства объекта "исчезают" в async блоках
        // 
        // ⚠️ АЛЬТЕРНАТИВНЫЕ ПОДХОДЫ:
        // - Использовать WeakMap для хранения ссылок
        // - Применить паттерн "Immutable References"
        // - Избегать сложных async/await цепочек
        // - Использовать функциональный подход вместо классов
        // 
        // 💡 ПРОФИЛАКТИКА:
        // - Минимизировать мутации свойств в async коде
        // - Использовать const для критически важных ссылок
        // - Тестировать компоненты в изоляции
        // - Добавлять проверки целостности данных
        // =============================================================================
        
        console.log('✅ Spline rocket elements setup completed');
        return true;
    }
    
    setupAnimations() {
        if (!this.shouldAnimate || !this.isLoaded) {
            return;
        }
        
        // Настраиваем ScrollTrigger для анимации ракеты
        this.setupScrollTrigger();
        
        console.log('✅ Spline rocket animations setup completed');
    }
    
    afterInit() {
        super.afterInit();
        
        if (this.shouldAnimate && this.isLoaded) {
            console.log('🚀 SplineRocketScroll initialized successfully');
            this.emit('rocketReady');
        }
    }
    
    // =============================================================================
    // Spline интеграция
    // =============================================================================
    
    async loadSplineScene() {
        try {
            console.log('📦 Loading local Spline runtime...');
            
            // КРИТИЧЕСКАЯ ПРОВЕРКА: Убеждаемся, что canvas существует и готов
            if (!this.canvas) {
                throw new Error('Canvas element is null - cannot create Spline Application');
            }
            
            if (!this.canvas.parentNode) {
                throw new Error('Canvas element is not attached to DOM - cannot create Spline Application');
            }
            
            console.log('✅ Canvas validation passed:', {
                canvas: this.canvas,
                id: this.canvas.id,
                className: this.canvas.className,
                width: this.canvas.width,
                height: this.canvas.height,
                parentNode: this.canvas.parentNode.tagName
            });
            
            // Динамически импортируем локальный Spline Runtime
            const { Application } = await import(this.options.splineRuntime);
            
            console.log('🎬 Creating Spline application with local runtime...');
            
            // Создаем приложение используя импортированный класс
            this.splineApp = new Application(this.canvas);
            
            // Загружаем сцену
            console.log('🌍 Loading Spline scene:', this.options.splineScene);
            await this.splineApp.load(this.options.splineScene);
            
            // Ищем объект ракеты в сцене
            this.rocket = this.splineApp.findObjectByName(this.options.rocketName);
            
            if (!this.rocket) {
                console.warn('⚠️ Rocket object not found by name, trying to find first object...');
                // Попробуем найти первый объект в сцене
                if (this.splineApp.scene && this.splineApp.scene.children && this.splineApp.scene.children.length > 0) {
                    this.rocket = this.splineApp.scene.children[0];
                    console.log('🎯 Using first scene object as rocket:', this.rocket);
                }
            }
            
            if (this.rocket) {
                console.log('🚀 Rocket object found:', this.rocket);
                this.isLoaded = true;
                this.emit('splineLoaded', { rocket: this.rocket });
                
                // Устанавливаем начальную позицию
                this.setInitialRocketPosition();
            } else {
                throw new Error('No suitable rocket object found in scene');
            }
            
            console.log('✅ Spline scene loaded successfully with local runtime');
            
        } catch (error) {
            console.error('❌ Detailed Spline loading error:', {
                message: error.message,
                stack: error.stack,
                sceneUrl: this.options.splineScene,
                runtimeUrl: this.options.splineRuntime,
                canvasElement: this.canvas,
                splineApp: this.splineApp
            });
            
            this.handleError('Failed to load Spline scene', error);
            this.shouldAnimate = false;
            
            // Эмитим событие ошибки с подробностями
            this.emit('error', {
                type: 'spline_load_error',
                message: error.message,
                sceneUrl: this.options.splineScene,
                runtimeUrl: this.options.splineRuntime
            });
        }
    }
    
    setInitialRocketPosition() {
        if (!this.rocket || !this.rocket.position) return;
        
        // Устанавливаем начальную позицию ракеты (слева вверху за экраном)
        this.rocket.position.x = -400;
        this.rocket.position.y = 300;
        this.rocket.position.z = 0;
        
        if (this.rocket.rotation) {
            this.rocket.rotation.x = 0;
            this.rocket.rotation.y = 0;
            this.rocket.rotation.z = 0;
        }
        
        console.log('🎯 Initial rocket position set');
    }
    
    // =============================================================================
    // ScrollTrigger интеграция
    // =============================================================================
    
    setupScrollTrigger() {
        if (!this.animationService?.scrollTriggerManager) {
            console.warn('⚠️ ScrollTriggerManager not available, using fallback');
            this.setupScrollTriggerFallback();
            return;
        }
        
        // Используем существующую систему ScrollTrigger
        this.animationService.scrollTriggerManager.create({
            id: 'spline_rocket_scroll',
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1, // Плавная привязка к скроллу
            onUpdate: (self) => {
                this.updateRocketPosition(self.progress);
            },
            onRefresh: () => {
                console.log('🔄 Rocket ScrollTrigger refreshed');
            }
        });
        
        console.log('✅ Spline rocket ScrollTrigger setup completed');
    }
    
    setupScrollTriggerFallback() {
        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                this.updateRocketPosition(self.progress);
            }
        });
        
        console.log('✅ Spline rocket ScrollTrigger fallback setup completed');
    }
    
    // =============================================================================
    // Анимация ракеты
    // =============================================================================
    
    updateRocketPosition(progress) {
        if (!this.isLoaded || !this.rocket || !this.shouldAnimate) return;
        
        // Throttling для производительности (~60fps)
        const now = Date.now();
        if (now - this.lastUpdate < this.options.throttleDelay) return;
        this.lastUpdate = now;
        
        // Рассчитываем позицию на траектории
        const position = this.calculatePositionOnTrajectory(progress);
        
        // Обновляем позицию ракеты
        if (this.rocket.position) {
            this.rocket.position.x = position.x;
            this.rocket.position.y = position.y;
            this.rocket.position.z = position.z || 0;
        }
        
        // Обновляем поворот ракеты по направлению движения
        if (this.rocket.rotation && position.rotation) {
            this.rocket.rotation.x = position.rotation.x || 0;
            this.rocket.rotation.y = position.rotation.y || 0;
            this.rocket.rotation.z = position.rotation.z || 0;
        }
        
        this.currentProgress = progress;
        
        // Эмитим событие обновления (закомментировано для производительности)
        // this.emit('rocketPositionUpdated', { progress, position });
    }
    
    calculatePositionOnTrajectory(progress) {
        // Определяем ключевые точки траектории (зигзаг по сайту)
        const trajectoryPoints = [
            // Точка 1: Старт слева вверху (за экраном)
            { progress: 0,    x: -400, y: 300,  z: 0, rotation: { z: 0 } },
            // Точка 2: Вход в экран, диагональ вправо вниз
            { progress: 0.12, x: 300,  y: 150,  z: 0, rotation: { z: -25 } },
            // Точка 3: Диагональ влево вниз
            { progress: 0.25, x: -250, y: 0,    z: 0, rotation: { z: 35 } },
            // Точка 4: Диагональ вправо вниз
            { progress: 0.38, x: 350,  y: -150, z: 0, rotation: { z: -30 } },
            // Точка 5: Диагональ влево вниз
            { progress: 0.5,  x: -200, y: -300, z: 0, rotation: { z: 40 } },
            // Точка 6: Диагональ вправо вниз
            { progress: 0.65, x: 400,  y: -450, z: 0, rotation: { z: -35 } },
            // Точка 7: Диагональ влево вниз
            { progress: 0.8,  x: -150, y: -600, z: 0, rotation: { z: 45 } },
            // Точка 8: Финиш вправо вниз (за экран)
            { progress: 1,    x: 300,  y: -800, z: 0, rotation: { z: -20 } }
        ];
        
        // Находим два ближайших ключевых кадра для интерполяции
        let startPoint = trajectoryPoints[0];
        let endPoint = trajectoryPoints[trajectoryPoints.length - 1];
        
        for (let i = 0; i < trajectoryPoints.length - 1; i++) {
            if (progress >= trajectoryPoints[i].progress && progress <= trajectoryPoints[i + 1].progress) {
                startPoint = trajectoryPoints[i];
                endPoint = trajectoryPoints[i + 1];
                break;
            }
        }
        
        // Рассчитываем локальный прогресс между двумя точками
        const segmentLength = endPoint.progress - startPoint.progress;
        const segmentProgress = segmentLength > 0 ? (progress - startPoint.progress) / segmentLength : 0;
        
        // Применяем easing для более плавного движения
        const smoothProgress = this.easeInOutCubic(segmentProgress);
        
        // Интерполируем позицию и поворот
        return {
            x: this.lerp(startPoint.x, endPoint.x, smoothProgress),
            y: this.lerp(startPoint.y, endPoint.y, smoothProgress),
            z: this.lerp(startPoint.z || 0, endPoint.z || 0, smoothProgress),
            rotation: {
                x: this.lerp(startPoint.rotation?.x || 0, endPoint.rotation?.x || 0, smoothProgress),
                y: this.lerp(startPoint.rotation?.y || 0, endPoint.rotation?.y || 0, smoothProgress),
                z: this.lerp(startPoint.rotation?.z || 0, endPoint.rotation?.z || 0, smoothProgress)
            }
        };
    }
    
    // =============================================================================
    // Утилитарные функции
    // =============================================================================
    
    lerp(start, end, progress) {
        return start + (end - start) * progress;
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    checkAnimationConditions() {
        // Проверяем мобильное устройство
        if (this.isMobile && !this.options.enableOnMobile) {
            this.shouldAnimate = false;
            console.log('🚀 Rocket animation disabled on mobile');
            return;
        }
        
        // Проверяем prefers-reduced-motion
        if (this.reducedMotion && this.options.respectReducedMotion) {
            this.shouldAnimate = false;
            console.log('🚀 Rocket animation disabled due to reduced motion preference');
            return;
        }
        
        this.shouldAnimate = true;
    }
    
    // =============================================================================
    // Публичные методы управления
    // =============================================================================
    
    showRocket() {
        if (this.rocket && this.rocket.visible !== undefined) {
            this.rocket.visible = true;
            this.emit('rocketShown');
            console.log('🚀 Rocket shown');
        }
    }
    
    hideRocket() {
        if (this.rocket && this.rocket.visible !== undefined) {
            this.rocket.visible = false;
            this.emit('rocketHidden');
            console.log('🚀 Rocket hidden');
        }
    }
    
    pauseAnimation() {
        this.shouldAnimate = false;
        this.emit('animationPaused');
        console.log('⏸️ Rocket animation paused');
    }
    
    resumeAnimation() {
        if (!this.isMobile || this.options.enableOnMobile) {
            this.shouldAnimate = true;
            this.emit('animationResumed');
            console.log('▶️ Rocket animation resumed');
        }
    }
    
    // Получение текущего состояния
    getState() {
        return {
            isLoaded: this.isLoaded,
            shouldAnimate: this.shouldAnimate,
            currentProgress: this.currentProgress,
            isMobile: this.isMobile,
            rocketVisible: this.rocket?.visible,
            hasRocket: !!this.rocket
        };
    }
    
    // =============================================================================
    // Обработка resize
    // =============================================================================
    
    handleResize() {
        super.handleResize();
        
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        // Если изменился статус мобильного устройства
        if (wasMobile !== this.isMobile) {
            this.checkAnimationConditions();
            
            if (!this.shouldAnimate) {
                this.hideRocket();
            } else if (this.isLoaded) {
                this.showRocket();
            }
        }
        
        // Обновляем размеры canvas
        if (this.canvas && this.splineApp) {
            this.splineApp.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    // =============================================================================
    // Очистка ресурсов
    // =============================================================================
    
    destroy() {
        console.log('🚀 Destroying SplineRocketScroll...');
        
        // Очищаем Spline приложение
        if (this.splineApp) {
            try {
                this.splineApp.dispose();
            } catch (error) {
                console.warn('⚠️ Error disposing Spline app:', error);
            }
            this.splineApp = null;
        }
        
        // Удаляем canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
        }
        
        // Сбрасываем состояние
        this.rocket = null;
        this.isLoaded = false;
        this.shouldAnimate = false;
        
        // Вызываем родительский метод очистки
        super.destroy();
        
        console.log('✅ SplineRocketScroll destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.SplineRocketScroll = SplineRocketScroll;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SplineRocketScroll;
}
