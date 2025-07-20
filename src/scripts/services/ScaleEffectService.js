// =============================================================================
// Scale Effect Service - Управление эффектом масштабирования
// =============================================================================

class ScaleEffectService {
    constructor(squareElement, cubeElement, animationService) {
        this.square = squareElement;
        this.cube = cubeElement;
        this.animationService = animationService;
        
        // Состояние масштабирования
        this.isScalingMode = false;
        this.scaleCompleted = false;
        this.cubeToSquareSwapped = false;
        
        // Элемент фона для прямого управления
        this.squareBg = null;
        
        this.init();
    }
    
    init() {
        if (!this.square || !this.cube) {
            console.warn('⚠️ Required elements not found in ScaleEffectService');
            return;
        }
        
        console.log('🔥 ScaleEffectService initialized');
    }
    
    /**
     * Начало эффекта масштабирования
     */
    startScaleEffect() {
        if (!this.isScalingMode) {
            this.isScalingMode = true;
            this.square.parentElement.classList.add('scaling-mode');
            console.log('🔥 Начинается эффект масштабирования!');
        }
    }
    
    /**
     * Остановка эффекта масштабирования
     */
    stopScaleEffect() {
        if (this.isScalingMode) {
            this.isScalingMode = false;
            this.scaleCompleted = false;
            this.square.parentElement.classList.remove('scaling-mode');
            console.log('🔄 Режим масштабирования отключен');
        }
    }
    
    /**
     * Применение эффекта масштабирования
     * @param {number} progress - Прогресс масштабирования (0-1)
     */
    applyScaleEffect(progress) {
        if (!this.cubeToSquareSwapped) {
            console.warn('⚠️ Квадрат не активен! Подмена не произошла.');
            return;
        }
        
        // Гарантируем полную непрозрачность квадрата
        const currentOpacity = parseFloat(window.getComputedStyle(this.square).opacity);
        if (currentOpacity < 1) {
            gsap.set(this.square, { opacity: 1 });
            console.log(`🔧 Исправлена прозрачность квадрата: ${currentOpacity} → 1`);
        }
        
        // 2D масштабирование квадрата для заполнения viewport
        let scaleX = 1 + (progress * ((window.innerWidth / 200) - 1));
        let scaleY = 1 + (progress * ((window.innerHeight / 200) - 1));
        
        // Плавная защита от неполного заполнения
        if (progress > 0.85) {
            const forceProgress = (progress - 0.85) / 0.15;
            const targetScaleX = window.innerWidth / 200;
            const targetScaleY = window.innerHeight / 200;
            
            const forceStrength = 0.2;
            scaleX = gsap.utils.interpolate(scaleX, targetScaleX, forceProgress * forceStrength);
            scaleY = gsap.utils.interpolate(scaleY, targetScaleY, forceProgress * forceStrength);
        }
        
        // Повышаем z-index для полного покрытия
        const zIndex = 20 + Math.floor(progress * 9);
        
        // Рассчитываем обратные значения масштаба для компенсации в CSS
        const inverseScaleX = 1 / scaleX;
        const inverseScaleY = 1 / scaleY;
        
        // Устанавливаем CSS custom properties для компенсации масштабирования фона
        this.square.style.setProperty('--inverse-scale-x', inverseScaleX);
        this.square.style.setProperty('--inverse-scale-y', inverseScaleY);
        
        // Применяем 2D трансформацию к квадрату
        if (this.animationService && this.animationService.scrollTriggerManager) {
            gsap.set(this.square, {
                scaleX: scaleX,
                scaleY: scaleY,
                zIndex: zIndex,
                opacity: 1,
                overwrite: true
            });
        } else {
            // Fallback к прямому GSAP
            gsap.set(this.square, {
                scaleX: scaleX,
                scaleY: scaleY,
                zIndex: zIndex,
                opacity: 1,
                overwrite: true
            });
        }
        
        // Получаем реальные размеры квадрата ПОСЛЕ применения масштаба
        const realRect = this.square.getBoundingClientRect();
        const realWidth = realRect.width;
        const realHeight = realRect.height;
        
        // Проверка заполнения viewport
        const isWidthCovered = realWidth >= window.innerWidth;
        const isHeightCovered = realHeight >= window.innerHeight;
        const isFullyFilled = isWidthCovered && isHeightCovered;
        
        // Останавливаем масштабирование когда viewport полностью заполнен
        if (isFullyFilled && !this.scaleCompleted) {
            this.scaleCompleted = true;
            console.log('🔴 Viewport полностью заполнен квадратом! Масштабирование остановлено.');
        }
        
        // Fallback: принудительное завершение масштабирования при высоком прогрессе
        if (progress >= 0.95 && !this.scaleCompleted) {
            console.log('🛡️ Fallback: принудительное завершение масштабирования при 95% прогресса');
            this.scaleCompleted = true;
        }
        
        return {
            isFullyFilled,
            realWidth,
            realHeight,
            scaleX,
            scaleY
        };
    }
    
    /**
     * Подмена 3D куба на 2D квадрат
     */
    swapCubeToSquare() {
        if (this.cubeToSquareSwapped) return; // Уже подменен
        
        console.log('🔄 Подмена: 3D куб → 2D квадрат');
        
        // Инициализируем элемент фона при подмене
        this.initSquareBackground();
        
        // Плавно скрываем куб с использованием AnimationService
        if (this.animationService && this.animationService.scrollTriggerManager) {
            const hideTimeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                id: 'cube_hide'
            });
            
            if (hideTimeline) {
                hideTimeline.to(this.cube, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                this.hideCubeFallback();
            }
        } else {
            this.hideCubeFallback();
        }
        
        // ✅ ИСПРАВЛЕНИЕ: Принудительно показываем квадрат без анимации
        gsap.set(this.square, {
            opacity: 1,
            overwrite: true
        });
        console.log('✅ Квадрат принудительно показан с opacity: 1');
        
        this.cubeToSquareSwapped = true;
        console.log('✅ Подмена завершена! Теперь работаем с 2D квадратом.');
        
        // 🔍 ДИАГНОСТИКА: Проверяем состояние квадрата после подмены
        const squareStyles = window.getComputedStyle(this.square);
        console.log('🔍 Состояние квадрата после подмены:', {
            opacity: squareStyles.opacity,
            display: squareStyles.display,
            visibility: squareStyles.visibility,
            transform: squareStyles.transform,
            zIndex: squareStyles.zIndex,
            width: squareStyles.width,
            height: squareStyles.height,
            position: squareStyles.position
        });
    }
    
    /**
     * Fallback для скрытия куба
     */
    hideCubeFallback() {
        gsap.to(this.cube, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    }
    
    /**
     * Fallback для показа квадрата
     */
    showSquareFallback() {
        gsap.to(this.square, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
            delay: 0.1
        });
    }
    
    /**
     * Обратная подмена: 2D квадрат → 3D куб
     */
    swapSquareToCube() {
        if (!this.cubeToSquareSwapped) return; // Уже куб
        
        console.log('🔄 Обратная подмена: 2D квадрат → 3D куб');
        
        // Сбрасываем масштабирование квадрата к исходному состоянию
        gsap.set(this.square, {
            scaleX: 1,
            scaleY: 1,
            zIndex: 20,
            overwrite: true
        });
        
        // Плавно скрываем квадрат
        if (this.animationService && this.animationService.scrollTriggerManager) {
            const hideTimeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                id: 'square_hide'
            });
            
            if (hideTimeline) {
                hideTimeline.to(this.square, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                this.hideSquareFallback();
            }
        } else {
            this.hideSquareFallback();
        }
        
        // ✅ ИСПРАВЛЕНИЕ: Принудительно показываем куб без анимации
        gsap.set(this.cube, {
            opacity: 1,
            overwrite: true
        });
        console.log('✅ Куб принудительно показан с opacity: 1');
        
        this.cubeToSquareSwapped = false;
        console.log('✅ Обратная подмена завершена! Квадрат сброшен к исходному состоянию.');
        
        // 🔍 ДИАГНОСТИКА: Проверяем состояние куба после обратной подмены
        const cubeStyles = window.getComputedStyle(this.cube);
        console.log('🔍 Состояние куба после обратной подмены:', {
            opacity: cubeStyles.opacity,
            display: cubeStyles.display,
            visibility: cubeStyles.visibility,
            transform: cubeStyles.transform,
            zIndex: cubeStyles.zIndex,
            width: cubeStyles.width,
            height: cubeStyles.height,
            position: cubeStyles.position
        });
    }
    
    /**
     * Fallback для скрытия квадрата
     */
    hideSquareFallback() {
        gsap.to(this.square, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    }
    
    /**
     * Fallback для показа куба
     */
    showCubeFallback() {
        gsap.to(this.cube, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
            delay: 0.1
        });
    }
    
    /**
     * Инициализация элемента фона для прямого JavaScript управления
     */
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
    
    /**
     * Проверка заполнения viewport
     * @returns {object} Информация о заполнении
     */
    checkViewportFilling() {
        if (!this.cubeToSquareSwapped) {
            return {
                isFullyFilled: false,
                isWidthFilled: false,
                isHeightFilled: false,
                realWidth: 0,
                realHeight: 0
            };
        }
        
        const realRect = this.square.getBoundingClientRect();
        const realWidth = realRect.width;
        const realHeight = realRect.height;
        
        const isWidthFilled = realWidth >= window.innerWidth;
        const isHeightFilled = realHeight >= window.innerHeight;
        const isFullyFilled = isWidthFilled && isHeightFilled;
        
        return {
            isFullyFilled,
            isWidthFilled,
            isHeightFilled,
            realWidth,
            realHeight,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };
    }
    
    /**
     * Получение текущего состояния масштабирования
     */
    getState() {
        const fillInfo = this.checkViewportFilling();
        
        return {
            isScalingMode: this.isScalingMode,
            scaleCompleted: this.scaleCompleted,
            cubeToSquareSwapped: this.cubeToSquareSwapped,
            squareBgInitialized: !!this.squareBg,
            ...fillInfo
        };
    }
    
    /**
     * Сброс масштабирования к исходному состоянию
     */
    reset() {
        console.log('🔥 Сброс масштабирования к исходному состоянию');
        
        // Останавливаем режим масштабирования
        this.stopScaleEffect();
        
        // Если квадрат активен, возвращаем к кубу
        if (this.cubeToSquareSwapped) {
            this.swapSquareToCube();
        }
        
        // Сбрасываем флаги
        this.scaleCompleted = false;
    }
    
    /**
     * Принудительная установка состояния завершения масштабирования
     * @param {boolean} completed - Завершено ли масштабирование
     */
    setScaleCompleted(completed) {
        this.scaleCompleted = completed;
        console.log(`🔥 Scale completed установлен в: ${completed}`);
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        // Сбрасываем состояние
        this.isScalingMode = false;
        this.scaleCompleted = false;
        this.cubeToSquareSwapped = false;
        
        // Очищаем CSS классы
        if (this.square && this.square.parentElement) {
            this.square.parentElement.classList.remove('scaling-mode');
        }
        
        // Сбрасываем масштабирование
        if (this.square) {
            gsap.set(this.square, {
                scaleX: 1,
                scaleY: 1,
                zIndex: 20,
                opacity: 0,
                clearProps: "transform"
            });
        }
        
        // Показываем куб
        if (this.cube) {
            gsap.set(this.cube, {
                opacity: 1
            });
        }
        
        // Очищаем ссылку на элемент фона
        this.squareBg = null;
        
        console.log('🔥 ScaleEffectService destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.ScaleEffectService = ScaleEffectService;
}
