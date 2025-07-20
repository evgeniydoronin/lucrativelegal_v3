// =============================================================================
// Text Visibility Service - Управление видимостью заголовков
// =============================================================================

class TextVisibilityService {
    constructor(animationService) {
        this.animationService = animationService;
        
        // Элементы заголовков
        this.titleContainer = null;
        this.subtitleContainer = null;
        
        // Состояние видимости
        this.textHidden = false;
        
        this.init();
    }
    
    init() {
        console.log('📝 TextVisibilityService initialized');
        
        // Инициализируем элементы заголовков
        this.initTextContainers();
    }
    
    /**
     * Инициализация элементов заголовков
     */
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
    
    /**
     * Обновление видимости заголовков на основе условий
     * @param {boolean} shouldHideText - Должны ли заголовки быть скрыты
     */
    updateTextVisibility(shouldHideText) {
        if (shouldHideText && !this.textHidden) {
            this.hideTextContainers();
        } else if (!shouldHideText && this.textHidden) {
            this.showTextContainers();
        }
    }
    
    /**
     * Скрытие заголовков
     */
    hideTextContainers() {
        if (this.textHidden) return; // Уже скрыты
        
        console.log('📝 Скрываем заголовки hero секции');
        
        // Плавно скрываем title container с использованием AnimationService
        if (this.titleContainer) {
            if (this.animationService && this.animationService.scrollTriggerManager) {
                const titleTimeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                    id: 'title_hide'
                });
                
                if (titleTimeline) {
                    titleTimeline.to(this.titleContainer, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                } else {
                    this.hideTitleFallback();
                }
            } else {
                this.hideTitleFallback();
            }
        }
        
        // Плавно скрываем subtitle container с использованием AnimationService
        if (this.subtitleContainer) {
            if (this.animationService && this.animationService.scrollTriggerManager) {
                const subtitleTimeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                    id: 'subtitle_hide'
                });
                
                if (subtitleTimeline) {
                    subtitleTimeline.to(this.subtitleContainer, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                } else {
                    this.hideSubtitleFallback();
                }
            } else {
                this.hideSubtitleFallback();
            }
        }
        
        this.textHidden = true;
        console.log('✅ Заголовки hero секции скрыты');
    }
    
    /**
     * Fallback для скрытия title
     */
    hideTitleFallback() {
        gsap.to(this.titleContainer, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    }
    
    /**
     * Fallback для скрытия subtitle
     */
    hideSubtitleFallback() {
        gsap.to(this.subtitleContainer, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    }
    
    /**
     * Показ заголовков
     */
    showTextContainers() {
        if (!this.textHidden) return; // Уже показаны
        
        console.log('📝 Показываем заголовки hero секции');
        
        // Плавно показываем title container с использованием AnimationService
        if (this.titleContainer) {
            if (this.animationService && this.animationService.scrollTriggerManager) {
                const titleTimeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                    id: 'title_show'
                });
                
                if (titleTimeline) {
                    titleTimeline.to(this.titleContainer, {
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                } else {
                    this.showTitleFallback();
                }
            } else {
                this.showTitleFallback();
            }
        }
        
        // Плавно показываем subtitle container с использованием AnimationService
        if (this.subtitleContainer) {
            if (this.animationService && this.animationService.scrollTriggerManager) {
                const subtitleTimeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                    id: 'subtitle_show'
                });
                
                if (subtitleTimeline) {
                    subtitleTimeline.to(this.subtitleContainer, {
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                } else {
                    this.showSubtitleFallback();
                }
            } else {
                this.showSubtitleFallback();
            }
        }
        
        this.textHidden = false;
        console.log('✅ Заголовки hero секции показаны');
    }
    
    /**
     * Fallback для показа title
     */
    showTitleFallback() {
        gsap.to(this.titleContainer, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        });
    }
    
    /**
     * Fallback для показа subtitle
     */
    showSubtitleFallback() {
        gsap.to(this.subtitleContainer, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        });
    }
    
    /**
     * Обновление позиционирования заголовков (fixed/absolute)
     * @param {boolean} shouldBeAbsolute - Должны ли заголовки быть в absolute режиме
     */
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
    
    /**
     * Принудительная установка видимости заголовков
     * @param {boolean} visible - Должны ли заголовки быть видимы
     * @param {boolean} immediate - Мгновенное изменение без анимации
     */
    setTextVisibility(visible, immediate = false) {
        if (visible && this.textHidden) {
            if (immediate) {
                this.setTextOpacityImmediate(1);
                this.textHidden = false;
            } else {
                this.showTextContainers();
            }
        } else if (!visible && !this.textHidden) {
            if (immediate) {
                this.setTextOpacityImmediate(0);
                this.textHidden = true;
            } else {
                this.hideTextContainers();
            }
        }
    }
    
    /**
     * Мгновенная установка прозрачности заголовков
     * @param {number} opacity - Значение прозрачности (0-1)
     */
    setTextOpacityImmediate(opacity) {
        if (this.titleContainer) {
            gsap.set(this.titleContainer, { opacity: opacity });
        }
        if (this.subtitleContainer) {
            gsap.set(this.subtitleContainer, { opacity: opacity });
        }
        console.log(`📝 Прозрачность заголовков установлена мгновенно: ${opacity}`);
    }
    
    /**
     * Получение текущего состояния видимости
     */
    getState() {
        const titleOpacity = this.titleContainer ? 
            parseFloat(window.getComputedStyle(this.titleContainer).opacity) : 0;
        const subtitleOpacity = this.subtitleContainer ? 
            parseFloat(window.getComputedStyle(this.subtitleContainer).opacity) : 0;
        
        return {
            textHidden: this.textHidden,
            titleContainer: !!this.titleContainer,
            subtitleContainer: !!this.subtitleContainer,
            titleOpacity,
            subtitleOpacity,
            titleAbsoluteMode: this.titleContainer ? 
                this.titleContainer.classList.contains('absolute-mode') : false,
            subtitleAbsoluteMode: this.subtitleContainer ? 
                this.subtitleContainer.classList.contains('absolute-mode') : false
        };
    }
    
    /**
     * Проверка необходимости скрытия заголовков
     * @param {boolean} scaleCompleted - Завершено ли масштабирование
     * @param {boolean} cubeToSquareSwapped - Подменен ли куб на квадрат
     * @param {boolean} isFullyFilled - Заполнен ли viewport
     * @param {boolean} isSectionVisible - Видна ли секция
     * @param {boolean} isProgressReached - Достигнут ли нужный прогресс
     * @returns {boolean} Должны ли заголовки быть скрыты
     */
    shouldHideText(scaleCompleted, cubeToSquareSwapped, isFullyFilled, isSectionVisible, isProgressReached) {
        return scaleCompleted && 
               cubeToSquareSwapped && 
               isFullyFilled && 
               isSectionVisible && 
               isProgressReached;
    }
    
    /**
     * Сброс заголовков к исходному состоянию
     */
    reset() {
        console.log('📝 Сброс заголовков к исходному состоянию');
        
        // Показываем заголовки если они скрыты
        if (this.textHidden) {
            this.setTextVisibility(true, true); // Мгновенно показываем
        }
        
        // Сбрасываем позиционирование к fixed режиму
        this.updateTextContainersPositioning(false);
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        // Показываем заголовки
        this.setTextVisibility(true, true);
        
        // Очищаем CSS классы
        if (this.titleContainer) {
            this.titleContainer.classList.remove('absolute-mode');
        }
        if (this.subtitleContainer) {
            this.subtitleContainer.classList.remove('absolute-mode');
        }
        
        // Сбрасываем состояние
        this.textHidden = false;
        
        // Очищаем ссылки на элементы
        this.titleContainer = null;
        this.subtitleContainer = null;
        
        console.log('📝 TextVisibilityService destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.TextVisibilityService = TextVisibilityService;
}
