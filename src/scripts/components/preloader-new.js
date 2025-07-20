// =============================================================================
// Preloader Component - Refactored Version
// =============================================================================

/**
 * Preloader Component
 * Управляет анимацией загрузки с процентным счетчиком и взлетом ракеты
 * 
 * Использует:
 * - BaseComponent для базовой архитектуры (без GSAP зависимостей)
 * - Прямые requestAnimationFrame для плавных анимаций
 * - CSS анимации для ракеты и занавеса
 * - Правильный lifecycle и cleanup
 */

class Preloader extends BaseComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Анимации
            countdownDuration: 2000,
            completionDuration: 500,
            rocketTakeoffDuration: 3000,
            slicesAnimationDuration: 800,
            
            // Настройки загрузки
            initialPercentage: 10,
            targetPercentage: 1,
            finalPercentage: 0,
            
            // Команды
            commands: ['LAUNCHING YOUR ROI'],
            
            // Таймауты
            loadingCheckDelay: 2200,
            exitAnimationDelay: 800,
            rocketDelay: 800,
            
            // Debug
            debug: false
        };
    }
    
    // =============================================================================
    // Lifecycle Methods (BaseComponent)
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Состояние компонента
        this.state = {
            currentPercentage: this.options.initialPercentage,
            targetPercentage: this.options.initialPercentage,
            isComplete: false,
            isLoading: false,
            pageLoaded: false,
            currentCommand: '',
            animationPhase: 'initial' // 'initial', 'countdown', 'completion', 'exit', 'rocket', 'slices', 'hidden'
        };
        
        // Элементы (будут найдены в setupElements)
        this.elements = {
            preloader: null,
            percentage: null,
            command: null,
            slices: null,
            rocket: null
        };
        
        // Анимации
        this.animationId = null;
        this.fallbackTimer = null;
        
        this.log('debug', 'Preloader beforeInit - конфигурация готова');
        return true;
    }
    
    setupElements() {
        // Основные элементы
        this.elements.preloader = document.getElementById('preloader');
        this.elements.percentage = document.getElementById('preloader-percentage');
        this.elements.command = document.getElementById('preloader-command');
        this.elements.slices = document.getElementById('preloader-slices');
        this.elements.rocket = document.getElementById('preloader-rocket');
        
        // Валидация критических элементов
        if (!this.elements.preloader) {
            this.log('error', 'Preloader element not found');
            return false;
        }
        
        this.log('info', 'Preloader elements found', {
            hasPercentage: !!this.elements.percentage,
            hasCommand: !!this.elements.command,
            hasSlices: !!this.elements.slices,
            hasRocket: !!this.elements.rocket
        });
        
        return true;
    }
    
    bindEvents() {
        // Слушаем событие загрузки страницы
        if (document.readyState === 'complete') {
            // Страница уже загружена
            setTimeout(() => this.handlePageLoad(), 0);
        } else {
            // Используем нативный addEventListener вместо this.addEventHandler
            window.addEventListener('load', this.handlePageLoad.bind(this));
        }
        
        this.log('debug', 'Preloader events bound');
    }
    
    setupAnimations() {
        // Preloader не использует GSAP - только requestAnimationFrame
        // Это простой компонент с кастомными анимациями
        this.log('info', 'Preloader animations setup completed (using requestAnimationFrame)');
    }
    
    afterInit() {
        // Показываем preloader и начинаем загрузку
        this.show();
        this.updatePercentageDisplay();
        this.startLoading();
        
        this.log('info', 'Preloader component fully initialized', {
            initialPercentage: this.state.currentPercentage,
            pageLoaded: document.readyState === 'complete'
        });
    }
    
    // =============================================================================
    // Event Handlers
    // =============================================================================
    
    handlePageLoad() {
        this.log('debug', 'Page fully loaded');
        this.state.pageLoaded = true;
        
        // Если анимация загрузки еще не завершена, ждем
        if (!this.state.isLoading) {
            this.completeLoading();
        }
        
        this.emit('pageLoaded');
    }
    
    // =============================================================================
    // Preloader Control
    // =============================================================================
    
    show() {
        if (this.elements.preloader) {
            this.elements.preloader.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            this.state.animationPhase = 'initial';
            this.emit('shown');
            this.log('debug', 'Preloader shown');
        }
    }
    
    hide() {
        if (this.elements.preloader) {
            this.elements.preloader.classList.add('hidden');
            document.body.style.overflow = '';
            this.state.animationPhase = 'hidden';
            
            // Очищаем ресурсы
            this.cleanup();
            
            // Удаляем из DOM через секунду
            setTimeout(() => {
                if (this.elements.preloader && this.elements.preloader.parentNode) {
                    this.elements.preloader.parentNode.removeChild(this.elements.preloader);
                }
            }, 1000);
            
            this.emit('hidden');
            this.log('debug', 'Preloader hidden');
        }
    }
    
    forceHide() {
        this.log('warn', 'Force hiding preloader');
        this.hide();
        this.emit('forceHidden');
    }
    
    // =============================================================================
    // Loading Animation
    // =============================================================================
    
    startLoading() {
        if (this.state.isLoading) {
            this.log('warn', 'Animation already running, skipping');
            return;
        }
        
        this.state.isLoading = true;
        this.state.animationPhase = 'countdown';
        
        this.log('debug', `Starting countdown from ${this.options.initialPercentage} to ${this.options.targetPercentage}`);
        
        // Плавная анимация от 10 до 1 за 2 секунды
        this.animateToPercentage(this.options.targetPercentage, this.options.countdownDuration);
        
        // Через 2.2 секунды проверяем загрузку страницы
        setTimeout(() => {
            this.state.isLoading = false;
            if (this.state.pageLoaded) {
                this.completeLoading();
            }
        }, this.options.loadingCheckDelay);
        
        this.emit('loadingStarted');
    }
    
    completeLoading() {
        this.log('debug', `Completing countdown to ${this.options.finalPercentage}`);
        this.state.animationPhase = 'completion';
        
        // Завершаем отсчет до 0
        this.animateToPercentage(this.options.finalPercentage, this.options.completionDuration);
        
        setTimeout(() => {
            this.startExitAnimation();
        }, this.options.exitAnimationDelay);
        
        this.emit('loadingCompleted');
    }
    
    animateToPercentage(target, duration) {
        this.state.targetPercentage = target;
        const startPercentage = this.state.currentPercentage;
        const difference = target - startPercentage;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Используем easing функцию для плавности
            const easeProgress = this.easeOutCubic(progress);
            
            this.state.currentPercentage = startPercentage + (difference * easeProgress);
            this.updatePercentageDisplay();
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.state.currentPercentage = target;
                this.updatePercentageDisplay();
                this.animationId = null;
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    updatePercentageDisplay() {
        if (this.elements.percentage) {
            const displayPercentage = Math.round(this.state.currentPercentage);
            this.elements.percentage.textContent = `${displayPercentage}`;
            
            // Обновляем команду
            this.updateCommand(displayPercentage);
        }
    }
    
    updateCommand(percentage) {
        // Всегда показываем единственную команду
        const newCommand = this.options.commands[0];
        
        // Обновляем только если команда изменилась
        if (newCommand !== this.state.currentCommand) {
            this.state.currentCommand = newCommand;
            this.showCommand(newCommand);
        }
    }
    
    showCommand(commandText) {
        if (this.elements.command && commandText) {
            // Обновляем текст и показываем с fade эффектом
            this.elements.command.innerHTML = commandText;
            this.elements.command.classList.remove('visible');
            
            // Небольшая задержка для плавного перехода
            setTimeout(() => {
                this.elements.command.classList.add('visible');
            }, 50);
        }
    }
    
    // =============================================================================
    // Exit Animation
    // =============================================================================
    
    startExitAnimation() {
        this.log('debug', 'Starting preloader exit animation');
        this.state.animationPhase = 'exit';
        
        // Отменяем fallback таймер если он есть
        if (this.fallbackTimer) {
            clearTimeout(this.fallbackTimer);
            this.fallbackTimer = null;
            this.log('debug', 'Fallback timer cancelled on exit animation start');
        }
        
        // Скрываем основной контент
        setTimeout(() => {
            if (this.elements.percentage) this.elements.percentage.style.opacity = '0';
            if (this.elements.command) this.elements.command.style.opacity = '0';
        }, 500);
        
        // Запускаем анимацию ракеты
        setTimeout(() => {
            this.startRocketTakeoff();
        }, this.options.rocketDelay);
        
        this.emit('exitAnimationStarted');
    }
    
    startRocketTakeoff() {
        this.log('debug', 'Starting rocket takeoff animation');
        this.state.animationPhase = 'rocket';
        
        if (this.elements.rocket) {
            // Добавляем класс анимации взлета
            this.elements.rocket.classList.add('takeoff');
            
            // Слушаем окончание анимации
            const handleAnimationEnd = () => {
                this.log('debug', 'Rocket has taken off, starting slices animation');
                this.elements.rocket.removeEventListener('animationend', handleAnimationEnd);
                this.startSlicesAnimation();
            };
            
            // Используем нативный addEventListener вместо this.addEventHandler
            this.elements.rocket.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback на случай если событие не сработает
            setTimeout(() => {
                if (this.elements.rocket && this.elements.rocket.classList.contains('takeoff')) {
                    this.log('debug', 'Fallback: starting slices animation after rocket takeoff');
                    this.elements.rocket.removeEventListener('animationend', handleAnimationEnd);
                    this.startSlicesAnimation();
                }
            }, this.options.rocketTakeoffDuration + 500); // анимация + буфер
        } else {
            // Если ракета не найдена, скрываем preloader
            this.log('warn', 'Rocket element not found, hiding preloader');
            this.hide();
        }
        
        this.emit('rocketTakeoffStarted');
    }
    
    startSlicesAnimation() {
        this.log('debug', 'Starting curtain separation animation');
        this.state.animationPhase = 'slices';
        
        // Запускаем анимацию разделения занавеса
        if (this.elements.slices) {
            this.elements.slices.classList.add('animate');
            
            // Скрываем preloader после завершения анимации занавеса
            setTimeout(() => {
                this.hide();
            }, this.options.slicesAnimationDuration);
        } else {
            // Если slices не найдены, скрываем preloader
            this.hide();
        }
        
        this.emit('slicesAnimationStarted');
    }
    
    // =============================================================================
    // Utility Methods
    // =============================================================================
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    cleanup() {
        // Отменяем анимацию
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Отменяем fallback таймер
        if (this.fallbackTimer) {
            clearTimeout(this.fallbackTimer);
            this.fallbackTimer = null;
            this.log('debug', 'Fallback timer cancelled');
        }
        
        // Восстанавливаем overflow
        document.body.style.overflow = '';
    }
    
    // =============================================================================
    // Public API Methods
    // =============================================================================
    
    /**
     * Получить текущее состояние preloader
     */
    getState() {
        // Защитная проверка - this.state может быть undefined до инициализации
        if (!this.state) {
            return {
                isInitialized: false,
                isDestroyed: false,
                id: this.id || 'unknown',
                currentPercentage: 0,
                targetPercentage: 0,
                isComplete: false,
                isLoading: false,
                pageLoaded: false,
                animationPhase: 'not-initialized',
                currentCommand: ''
            };
        }
        
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            currentPercentage: Math.round(this.state.currentPercentage),
            targetPercentage: this.state.targetPercentage,
            isComplete: this.state.isComplete,
            isLoading: this.state.isLoading,
            pageLoaded: this.state.pageLoaded,
            animationPhase: this.state.animationPhase,
            currentCommand: this.state.currentCommand
        };
    }
    
    /**
     * Получить текущую фазу анимации
     */
    getAnimationPhase() {
        return this.state ? this.state.animationPhase : 'not-initialized';
    }
    
    /**
     * Проверить завершена ли загрузка
     */
    isLoadingComplete() {
        return this.state ? this.state.isComplete : false;
    }
    
    /**
     * Принудительно завершить загрузку
     */
    forceComplete() {
        if (!this.state) {
            this.log('warn', 'Cannot force complete - component not initialized');
            return;
        }
        
        if (this.state.animationPhase === 'countdown' || this.state.animationPhase === 'initial') {
            this.state.pageLoaded = true;
            this.state.isLoading = false;
            this.completeLoading();
            this.emit('forceCompleted');
            this.log('debug', 'Loading force completed');
        }
    }
    
    // =============================================================================
    // Cleanup (BaseComponent)
    // =============================================================================
    
    destroy() {
        // Очищаем анимации и таймеры
        this.cleanup();
        
        // Удаляем preloader из DOM если он еще там
        if (this.elements.preloader && this.elements.preloader.parentNode) {
            this.elements.preloader.parentNode.removeChild(this.elements.preloader);
        }
        
        // Очищаем состояние
        this.state = {
            currentPercentage: 0,
            targetPercentage: 0,
            isComplete: false,
            isLoading: false,
            pageLoaded: false,
            currentCommand: '',
            animationPhase: 'destroyed'
        };
        
        // Очищаем элементы
        this.elements = {
            preloader: null,
            percentage: null,
            command: null,
            slices: null,
            rocket: null
        };
        
        // Вызвать родительский destroy
        super.destroy();
        
        this.log('info', 'Preloader component destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.Preloader = Preloader;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Preloader;
}
