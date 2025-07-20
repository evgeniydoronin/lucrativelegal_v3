// =============================================================================
// Positioning Service - Управление позиционированием куба
// =============================================================================

class PositioningService {
    constructor(cubeContainer, heroElement, animationService) {
        this.cubeContainer = cubeContainer;
        this.heroElement = heroElement;
        this.animationService = animationService;
        
        // Состояние позиционирования
        this.isAbsoluteMode = false;
        this.fixedCenterY = window.innerHeight / 2;
        this.transitionTween = null;
        this.lastSwitchTime = 0;
        
        // QuickSetters для лучшей производительности
        this.setX = null;
        this.setY = null;
        
        this.init();
    }
    
    init() {
        if (!this.cubeContainer || !this.heroElement) {
            console.warn('⚠️ Required elements not found in PositioningService');
            return;
        }
        
        console.log('📍 PositioningService initialized');
        
        // Инициализируем quickSetters для лучшей производительности
        this.setX = gsap.quickSetter(this.cubeContainer, "x", "px");
        this.setY = gsap.quickSetter(this.cubeContainer, "y", "px");
    }
    
    /**
     * Проверка и обновление режима позиционирования
     */
    checkPositioningMode() {
        const heroRect = this.heroElement.getBoundingClientRect();
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
        
        // Переключение режимов с гистерезисом
        if (!this.isAbsoluteMode && shouldBeAbsolute) {
            this.switchToAbsoluteMode();
            this.lastSwitchTime = now;
            return 'absolute';
        } else if (this.isAbsoluteMode && shouldBeFixed) {
            this.switchToFixedMode();
            this.lastSwitchTime = now;
            return 'fixed';
        }
        
        return this.isAbsoluteMode ? 'absolute' : 'fixed';
    }
    
    /**
     * Переключение в fixed режим
     */
    switchToFixedMode() {
        if (this.isAbsoluteMode) {
            console.log('📍 === SWITCHING TO FIXED MODE ===');
            
            // Останавливаем предыдущую анимацию если есть
            if (this.transitionTween) {
                this.transitionTween.kill();
                this.transitionTween = null;
            }
            
            // Очищаем CSS свойства absolute режима
            this.cubeContainer.style.top = '';
            this.cubeContainer.style.left = '';
            this.cubeContainer.classList.remove('absolute-mode');
            
            // Плавный переход в fixed режим с использованием AnimationService
            if (this.animationService && this.animationService.scrollTriggerManager) {
                const timeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                    id: 'positioning_to_fixed'
                });
                
                if (timeline) {
                    timeline.to(this.cubeContainer, {
                        duration: 0.15,
                        clearProps: "x,y",
                        xPercent: -50,
                        yPercent: -50,
                        scale: 1,
                        ease: "power2.out",
                        overwrite: true
                    });
                } else {
                    this.switchToFixedFallback();
                }
            } else {
                this.switchToFixedFallback();
            }
            
            this.isAbsoluteMode = false;
            console.log('📍 === FIXED MODE COMPLETE ===');
        }
    }
    
    /**
     * Fallback для переключения в fixed режим
     */
    switchToFixedFallback() {
        gsap.to(this.cubeContainer, {
            duration: 0.15,
            clearProps: "x,y",
            xPercent: -50,
            yPercent: -50,
            scale: 1,
            ease: "power2.out",
            overwrite: true
        });
    }
    
    /**
     * Переключение в absolute режим
     */
    switchToAbsoluteMode() {
        if (!this.isAbsoluteMode) {
            console.log('📍 === SWITCHING TO ABSOLUTE MODE ===');
            
            // Останавливаем предыдущую анимацию если есть
            if (this.transitionTween) {
                this.transitionTween.kill();
                this.transitionTween = null;
            }
            
            // Получаем позицию hero секции
            const heroRect = this.heroElement.getBoundingClientRect();
            console.log(`📍 Hero rect: top=${heroRect.top}, bottom=${heroRect.bottom}, height=${heroRect.height}`);
            
            // Центр браузера в пикселях
            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;
            console.log(`📍 Viewport center: X=${viewportCenterX}, Y=${viewportCenterY}`);
            
            // Позиция hero секции относительно viewport
            const heroTop = heroRect.top;
            const heroLeft = heroRect.left;
            
            // Рассчитываем позицию для центра БРАУЗЕРА
            const targetX = viewportCenterX - heroLeft;
            const targetY = viewportCenterY - heroTop;
            console.log(`📍 Target position: X=${targetX}, Y=${targetY} (browser center)`);
            
            // Переключаем на absolute режим
            this.cubeContainer.classList.add('absolute-mode');
            
            // Устанавливаем позицию через CSS
            this.cubeContainer.style.left = targetX + 'px';
            this.cubeContainer.style.top = targetY + 'px';
            
            // Используем GSAP только для центрирования элемента
            gsap.set(this.cubeContainer, {
                clearProps: "x,y",
                xPercent: -50,
                yPercent: -50,
                overwrite: true
            });
            
            this.isAbsoluteMode = true;
            console.log('📍 === ABSOLUTE MODE COMPLETE ===');
        }
    }
    
    /**
     * Принудительная установка режима позиционирования
     * @param {string} mode - 'fixed' или 'absolute'
     */
    setMode(mode) {
        if (mode === 'fixed' && this.isAbsoluteMode) {
            this.switchToFixedMode();
        } else if (mode === 'absolute' && !this.isAbsoluteMode) {
            this.switchToAbsoluteMode();
        }
    }
    
    /**
     * Получение текущего режима позиционирования
     */
    getCurrentMode() {
        return this.isAbsoluteMode ? 'absolute' : 'fixed';
    }
    
    /**
     * Получение состояния позиционирования
     */
    getState() {
        const heroRect = this.heroElement.getBoundingClientRect();
        
        return {
            isAbsoluteMode: this.isAbsoluteMode,
            currentMode: this.getCurrentMode(),
            heroRect: {
                top: heroRect.top,
                bottom: heroRect.bottom,
                left: heroRect.left,
                right: heroRect.right,
                width: heroRect.width,
                height: heroRect.height
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                centerX: window.innerWidth / 2,
                centerY: window.innerHeight / 2
            },
            lastSwitchTime: this.lastSwitchTime,
            timeSinceLastSwitch: Date.now() - this.lastSwitchTime
        };
    }
    
    /**
     * Проверка необходимости переключения режима
     * @returns {object} Информация о необходимости переключения
     */
    shouldSwitchMode() {
        const heroRect = this.heroElement.getBoundingClientRect();
        const switchThreshold = window.innerHeight * 0.06;
        const shouldBeAbsolute = heroRect.bottom <= window.innerHeight + switchThreshold;
        const shouldBeFixed = heroRect.bottom >= window.innerHeight + (switchThreshold * 2);
        const timeSinceLastSwitch = Date.now() - this.lastSwitchTime;
        
        return {
            shouldBeAbsolute,
            shouldBeFixed,
            canSwitch: timeSinceLastSwitch >= 200,
            currentMode: this.getCurrentMode(),
            recommendedMode: shouldBeAbsolute ? 'absolute' : (shouldBeFixed ? 'fixed' : this.getCurrentMode()),
            timeSinceLastSwitch
        };
    }
    
    /**
     * Обновление размеров viewport (при resize)
     */
    updateViewportSize() {
        this.fixedCenterY = window.innerHeight / 2;
        
        // Если в absolute режиме, пересчитываем позицию
        if (this.isAbsoluteMode) {
            // Временно переключаемся в fixed и обратно для пересчета
            const wasAbsolute = this.isAbsoluteMode;
            this.isAbsoluteMode = false;
            this.switchToAbsoluteMode();
        }
        
        console.log('📍 Viewport size updated, fixedCenterY:', this.fixedCenterY);
    }
    
    /**
     * Сброс позиционирования к исходному состоянию
     */
    reset() {
        console.log('📍 Сброс позиционирования к исходному состоянию');
        
        // Останавливаем анимации
        if (this.transitionTween) {
            this.transitionTween.kill();
            this.transitionTween = null;
        }
        
        // Принудительно переключаем в fixed режим
        if (this.isAbsoluteMode) {
            this.switchToFixedMode();
        }
        
        // Сбрасываем время последнего переключения
        this.lastSwitchTime = 0;
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        // Останавливаем анимации
        if (this.transitionTween) {
            this.transitionTween.kill();
            this.transitionTween = null;
        }
        
        // Очищаем CSS классы и стили
        if (this.cubeContainer) {
            this.cubeContainer.classList.remove('absolute-mode');
            this.cubeContainer.style.top = '';
            this.cubeContainer.style.left = '';
        }
        
        // Сбрасываем состояние
        this.isAbsoluteMode = false;
        this.lastSwitchTime = 0;
        
        // Очищаем quickSetters
        this.setX = null;
        this.setY = null;
        
        console.log('📍 PositioningService destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.PositioningService = PositioningService;
}
