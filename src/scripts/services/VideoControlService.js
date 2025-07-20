// =============================================================================
// Video Control Service - Управление воспроизведением видео
// =============================================================================

class VideoControlService {
    constructor(videoElement, animationService) {
        this.video = videoElement;
        this.animationService = animationService;
        
        // Состояние видео
        this.videoShown = false;
        this.playButtonActivated = false;
        
        // Флаги навигационного сброса
        this.navigationReset = false;
        this.navigationResetTime = 0;
        
        this.init();
    }
    
    init() {
        if (!this.video) {
            console.warn('⚠️ Video element not found in VideoControlService');
            return;
        }
        
        console.log('🎬 VideoControlService initialized');
        
        // Устанавливаем начальное состояние видео
        this.resetVideoToInitialState();
    }
    
    /**
     * Показ магнитной play кнопки
     */
    showPlayButton() {
        if (this.playButtonActivated) return; // Кнопка уже активна
        
        console.log('🎬 Активируем магнитную play кнопку');
        
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
            // Fallback: на мобильных или если CursorPlayButton недоступен
            console.log('📱 Fallback: CursorPlayButton недоступен, активируем видео напрямую');
            this.startVideo();
        }
    }
    
    /**
     * Скрытие магнитной play кнопки (без сброса videoShown)
     */
    hidePlayButton() {
        if (!this.playButtonActivated) return; // Кнопка уже скрыта
        
        console.log('🔄 Скрываем магнитную play кнопку');
        
        // Проверяем доступность CursorPlayButton
        if (window.cursorPlayButton) {
            // Деактивируем магнитную кнопку
            window.cursorPlayButton.deactivate();
            console.log('✅ Магнитная play кнопка деактивирована.');
        }
        
        // Сбрасываем флаг активации кнопки
        this.playButtonActivated = false;
        
        console.log('🔄 Магнитная play кнопка скрыта (готова к повторному показу)');
    }
    
    /**
     * Запуск видео по клику пользователя
     */
    startVideo() {
        console.log('🎬 Запускаем видео по клику пользователя');
        
        // Деактивируем магнитную кнопку
        if (window.cursorPlayButton && window.cursorPlayButton.isActivated()) {
            window.cursorPlayButton.deactivate();
        }
        
        // Устанавливаем полноэкранные размеры через JavaScript
        if (this.video) {
            this.video.style.width = '100vw';
            this.video.style.height = 'auto';
            this.video.style.visibility = 'visible';
            this.video.style.pointerEvents = 'auto';
            
            console.log('🎬 Видео подготовлено: размеры установлены (100vw x auto), интерактивность включена');
        }
        
        // Плавно показываем видео с использованием AnimationService
        if (this.animationService && this.animationService.scrollTriggerManager) {
            const timeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                id: 'video_show'
            });
            
            if (timeline) {
                timeline.to(this.video, {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                        this.playVideoElement();
                    }
                });
            } else {
                // Fallback
                this.showVideoFallback();
            }
        } else {
            // Fallback к прямому GSAP
            this.showVideoFallback();
        }
        
        this.videoShown = true;
        console.log('✅ Видео запущено! Контролы доступны пользователю.');
    }
    
    /**
     * Fallback метод показа видео
     */
    showVideoFallback() {
        gsap.to(this.video, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                this.playVideoElement();
            }
        });
    }
    
    /**
     * Запуск воспроизведения видео элемента
     */
    playVideoElement() {
        if (!this.video) return;
        
        // Запускаем видео (теперь по клику - браузер не блокирует)
        this.video.play().then(() => {
            console.log('▶️ Видео запущено по клику пользователя');
        }).catch(error => {
            console.error('❌ Ошибка запуска видео:', error);
        });
    }
    
    /**
     * Скрытие видео при обратном скролле
     */
    hideVideo() {
        if (!this.videoShown) return; // Уже скрыто
        
        console.log('🎬 Скрываем видео при обратном скролле');
        
        // Останавливаем воспроизведение
        if (this.video) {
            this.video.pause();
        }
        
        // Плавно скрываем видео с использованием AnimationService
        if (this.animationService && this.animationService.scrollTriggerManager) {
            const timeline = this.animationService.scrollTriggerManager.createMasterTimeline({
                id: 'video_hide'
            });
            
            if (timeline) {
                timeline.to(this.video, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            } else {
                // Fallback
                this.hideVideoFallback();
            }
        } else {
            // Fallback к прямому GSAP
            this.hideVideoFallback();
        }
        
        // Деактивируем магнитную кнопку
        if (window.cursorPlayButton) {
            window.cursorPlayButton.deactivate();
            console.log('🎬 Магнитная play кнопка деактивирована');
        }
        
        // Сброс флагов
        this.videoShown = false;
        
        console.log('✅ Видео скрыто и остановлено.');
    }
    
    /**
     * Fallback метод скрытия видео
     */
    hideVideoFallback() {
        gsap.to(this.video, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    }
    
    /**
     * Полный сброс видео к исходному состоянию
     */
    resetVideoCompletely() {
        if (!this.videoShown) return; // Уже сброшено
        
        console.log('🎬 Полный сброс видео к исходному состоянию');
        
        // Останавливаем воспроизведение и сбрасываем к началу
        if (this.video) {
            this.video.pause();
            this.video.currentTime = 0; // Сброс к началу видео
            
            // Сбрасываем к минимальным размерам
            this.resetVideoToInitialState();
            
            console.log('🎬 Видео сброшено к начальному состоянию');
        }
        
        // Деактивируем магнитную кнопку
        if (window.cursorPlayButton && window.cursorPlayButton.isActivated()) {
            window.cursorPlayButton.deactivate();
        }
        
        // Полный сброс всех флагов
        this.videoShown = false;
        this.playButtonActivated = false;
        
        console.log('✅ Видео полностью сброшено к исходному состоянию');
    }
    
    /**
     * Сброс видео к начальному состоянию
     */
    resetVideoToInitialState() {
        if (!this.video) return;
        
        this.video.style.width = '0';
        this.video.style.height = '0';
        this.video.style.visibility = 'hidden';
        this.video.style.pointerEvents = 'none';
        this.video.style.opacity = '0';
    }
    
    /**
     * Сброс состояния видео при навигации
     * @param {boolean} fromNavigation - Сброс через навигацию
     */
    resetVideoState(fromNavigation = false) {
        console.log(`🔄 Сброс состояния видео ${fromNavigation ? 'через НАВИГАЦИЮ' : 'при мгновенном скролле'}`);
        
        // Запоминаем, что сброс произошел через навигацию
        if (fromNavigation) {
            this.navigationReset = true;
            this.navigationResetTime = Date.now();
            console.log('🧭 DEBUG: Установлен флаг navigationReset = true');
            
            // Таймер сброса на случай если пользователь не скроллит
            setTimeout(() => {
                if (this.navigationReset) {
                    this.navigationReset = false;
                    console.log('🕐 DEBUG: navigationReset сброшен по таймеру (2 сек)');
                }
            }, 2000);
        }
        
        // Используем метод полного сброса
        this.resetVideoCompletely();
        
        console.log(`✅ Состояние видео сброшено (navigationReset: ${this.navigationReset})`);
    }
    
    /**
     * Проверка и сброс navigationReset флага
     * @param {number} scrollProgress - Текущий прогресс скролла
     * @param {boolean} isScrollingDown - Направление скролла
     */
    checkNavigationReset(scrollProgress, isScrollingDown) {
        if (isScrollingDown && this.navigationReset && scrollProgress > 0.2) {
            // Дополнительная проверка - прошло ли достаточно времени с момента навигации
            const timeSinceNavigation = Date.now() - this.navigationResetTime;
            if (timeSinceNavigation > 1000) { // 1 секунда
                this.navigationReset = false;
                console.log('🔄 DEBUG: navigationReset сброшен после задержки и значительного скролла');
                return true;
            }
        }
        return false;
    }
    
    /**
     * Получение текущего состояния видео
     */
    getState() {
        return {
            videoShown: this.videoShown,
            playButtonActivated: this.playButtonActivated,
            navigationReset: this.navigationReset,
            navigationResetTime: this.navigationResetTime,
            currentTime: this.video ? this.video.currentTime : 0,
            paused: this.video ? this.video.paused : true
        };
    }
    
    /**
     * Проверка готовности к показу кнопки
     * @param {boolean} isFullyFilled - Заполнен ли viewport
     * @param {boolean} isSectionVisible - Видна ли секция
     * @param {boolean} isProgressReached - Достигнут ли нужный прогресс
     */
    shouldShowPlayButton(isFullyFilled, isSectionVisible, isProgressReached) {
        return isFullyFilled && 
               isSectionVisible && 
               isProgressReached && 
               !this.playButtonActivated && 
               !this.navigationReset;
    }
    
    /**
     * Проверка необходимости скрытия кнопки
     * @param {boolean} isFullyFilled - Заполнен ли viewport
     * @param {boolean} isSectionVisible - Видна ли секция
     * @param {boolean} isProgressReached - Достигнут ли нужный прогресс
     */
    shouldHidePlayButton(isFullyFilled, isSectionVisible, isProgressReached) {
        return (!isFullyFilled || !isSectionVisible || !isProgressReached) && 
               this.playButtonActivated;
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        // Останавливаем видео
        if (this.video) {
            this.video.pause();
            this.video.currentTime = 0;
        }
        
        // Деактивируем кнопку
        if (window.cursorPlayButton && window.cursorPlayButton.isActivated()) {
            window.cursorPlayButton.deactivate();
        }
        
        // Сбрасываем состояние
        this.videoShown = false;
        this.playButtonActivated = false;
        this.navigationReset = false;
        this.navigationResetTime = 0;
        
        console.log('🎬 VideoControlService destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.VideoControlService = VideoControlService;
}
