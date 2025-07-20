// =============================================================================
// Section Navigation Component - Refactored Version
// =============================================================================

/**
 * SectionNavigation Component
 * Управляет навигацией между секциями страницы
 * 
 * Использует:
 * - InteractiveComponent для базовой архитектуры (с событиями)
 * - Intersection Observer для точного отслеживания секций
 * - Throttled scroll обработчики для производительности
 * - Keyboard navigation поддержка
 * - Интеграция с Lenis smooth scroll
 * - Правильный lifecycle и cleanup
 */

class SectionNavigation extends InteractiveComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Селекторы
            navigationSelector: '#section-navigation',
            navItemSelector: '.section-nav-item',
            navButtonSelector: '.section-nav-button',
            
            // Настройки отслеживания
            updateThrottle: 100, // 100ms между обновлениями
            scrollDuration: 1.2, // Длительность плавного скролла
            scrollEasing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            
            // Intersection Observer настройки
            observerRootMargin: '-20% 0px -60% 0px', // Активируем когда секция в центре экрана
            observerThreshold: 0,
            
            // Интеграция
            lenisIntegration: true,
            heroCubeIntegration: true,
            cursorPlayButtonIntegration: true,
            
            // Accessibility
            keyboardNavigation: true,
            
            // Debug
            debug: false
        };
    }
    
    get requiredDependencies() {
        return []; // Не требует GSAP
    }
    
    // =============================================================================
    // Lifecycle Methods (BaseComponent)
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Состояние компонента
        this.state = {
            currentActiveSection: 'hero',
            isScrolling: false,
            lastUpdate: 0,
            lenisAvailable: false,
            heroCubeAvailable: false,
            cursorPlayButtonAvailable: false
        };
        
        // Элементы (будут найдены в setupElements)
        this.elements = {
            navigation: null,
            navItems: [],
            sections: []
        };
        
        // Observers и таймауты
        this.sectionObserver = null;
        this.scrollTimeout = null;
        this.throttledUpdateActiveSection = null;
        
        this.log('debug', 'SectionNavigation beforeInit - конфигурация готова');
        return true;
    }
    
    setupElements() {
        // Основной элемент навигации
        this.elements.navigation = document.querySelector(this.options.navigationSelector);
        
        if (!this.elements.navigation) {
            this.log('warn', 'Section navigation not found');
            return false;
        }
        
        // Собираем элементы навигации
        this.collectNavigationElements();
        
        // Собираем секции
        this.collectSections();
        
        this.log('info', 'SectionNavigation elements found', {
            hasNavigation: !!this.elements.navigation,
            navItemsCount: this.elements.navItems.length,
            sectionsCount: this.elements.sections.length
        });
        
        return this.elements.sections.length > 0;
    }
    
    bindEvents() {
        // Настройка автоматического resize обработчика (из InteractiveComponent)
        this.setupResizeHandler();
        
        // Создаем throttled функцию для обновления активной секции
        this.throttledUpdateActiveSection = this.throttle(
            this.updateActiveSection.bind(this), 
            this.options.updateThrottle
        );
        
        // Клики по элементам навигации
        this.bindNavigationClicks();
        
        // Keyboard navigation
        if (this.options.keyboardNavigation) {
            this.addEventHandler(this.elements.navigation, 'keydown', this.handleKeyboardNavigation.bind(this));
        }
        
        // Отслеживание скролла
        this.setupScrollTracking();
        
        this.log('debug', 'SectionNavigation events bound successfully');
        return true;
    }
    
    setupAnimations() {
        // SectionNavigation не использует сложные анимации
        // Только CSS transitions для визуальной обратной связи
        this.log('info', 'SectionNavigation animations setup completed (using CSS transitions)');
    }
    
    afterInit() {
        // Настраиваем Intersection Observer
        this.setupSectionObserver();
        
        // Проверяем доступность интеграций
        this.checkIntegrations();
        
        // Проверяем начальное состояние
        this.updateActiveSection();
        
        this.log('info', 'SectionNavigation component fully initialized', {
            sectionsCount: this.elements.sections.length,
            currentSection: this.state.currentActiveSection,
            lenisAvailable: this.state.lenisAvailable,
            heroCubeAvailable: this.state.heroCubeAvailable
        });
    }
    
    // =============================================================================
    // Element Collection
    // =============================================================================
    
    collectNavigationElements() {
        this.elements.navItems = Array.from(
            this.elements.navigation.querySelectorAll(this.options.navItemSelector)
        );
        
        this.log('debug', `Found ${this.elements.navItems.length} navigation items`);
    }
    
    collectSections() {
        this.elements.sections = this.elements.navItems.map(item => {
            const sectionId = item.dataset.section;
            const sectionElement = document.getElementById(sectionId);
            
            if (!sectionElement) {
                this.log('warn', `Section not found: ${sectionId}`);
                return null;
            }
            
            return {
                id: sectionId,
                element: sectionElement,
                navItem: item,
                title: item.dataset.title || sectionId
            };
        }).filter(Boolean); // Убираем null значения
        
        this.log('debug', `Found ${this.elements.sections.length} sections for navigation`);
    }
    
    // =============================================================================
    // Event Handlers
    // =============================================================================
    
    bindNavigationClicks() {
        this.elements.navItems.forEach(item => {
            const button = item.querySelector(this.options.navButtonSelector);
            if (button) {
                this.addEventHandler(button, 'click', (e) => {
                    e.preventDefault();
                    const sectionId = item.dataset.section;
                    this.scrollToSection(sectionId);
                }, { passive: false });
            }
        });
    }
    
    handleKeyboardNavigation(event) {
        if (!this.options.keyboardNavigation) return;
        
        const currentIndex = this.elements.navItems.findIndex(item => 
            item.dataset.section === this.state.currentActiveSection
        );
        
        let targetIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                targetIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                targetIndex = Math.min(this.elements.navItems.length - 1, currentIndex + 1);
                break;
            case 'Home':
                event.preventDefault();
                targetIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                targetIndex = this.elements.navItems.length - 1;
                break;
            default:
                return; // Не обрабатываем другие клавиши
        }
        
        if (targetIndex !== currentIndex) {
            const targetSection = this.elements.navItems[targetIndex].dataset.section;
            this.scrollToSection(targetSection);
        }
        
        this.emit('keyboardNavigation', { 
            key: event.key, 
            fromSection: this.state.currentActiveSection,
            toSection: this.elements.navItems[targetIndex].dataset.section
        });
    }
    
    // =============================================================================
    // Scroll Tracking
    // =============================================================================
    
    setupScrollTracking() {
        // Отслеживание через нативный scroll
        this.addEventHandler(window, 'scroll', this.throttledUpdateActiveSection, { passive: true });
        
        // Отслеживание через Lenis если доступен
        this.setupLenisScrollTracking();
    }
    
    setupLenisScrollTracking() {
        if (!this.options.lenisIntegration) return;
        
        if (window.app && window.app.lenis) {
            this.state.lenisAvailable = true;
            window.app.lenis.on('scroll', this.throttledUpdateActiveSection);
            this.log('debug', 'Lenis scroll tracking setup');
        }
    }
    
    updateActiveSection() {
        if (this.state.isScrolling) return; // Не обновляем во время программного скролла
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const centerPoint = scrollTop + (windowHeight / 2);
        
        let activeSection = null;
        let minDistance = Infinity;
        
        // Находим секцию ближайшую к центру экрана
        this.elements.sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionCenter = sectionTop + (rect.height / 2);
            const distance = Math.abs(centerPoint - sectionCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                activeSection = section.id;
            }
        });
        
        if (activeSection && activeSection !== this.state.currentActiveSection) {
            this.setActiveSection(activeSection);
        }
    }
    
    // =============================================================================
    // Section Observer
    // =============================================================================
    
    setupSectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: this.options.observerRootMargin,
            threshold: this.options.observerThreshold
        };
        
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.setActiveSection(sectionId);
                }
            });
        }, observerOptions);
        
        // Наблюдаем за всеми секциями
        this.elements.sections.forEach(section => {
            this.sectionObserver.observe(section.element);
        });
        
        this.log('debug', 'Section observer setup completed');
    }
    
    // =============================================================================
    // Active Section Management
    // =============================================================================
    
    setActiveSection(sectionId) {
        if (sectionId === this.state.currentActiveSection) return;
        
        const previousSection = this.state.currentActiveSection;
        
        // Убираем активный класс со всех элементов
        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Добавляем активный класс к текущей секции
        const activeItem = this.elements.navItems.find(item => item.dataset.section === sectionId);
        if (activeItem) {
            activeItem.classList.add('active');
            this.state.currentActiveSection = sectionId;
            
            // Логирование для отладки
            const sectionData = this.elements.sections.find(s => s.id === sectionId);
            if (sectionData) {
                this.log('debug', `Active section: ${sectionData.title} (${sectionId})`);
            }
            
            this.emit('sectionChanged', { 
                previousSection, 
                currentSection: sectionId,
                sectionTitle: sectionData?.title
            });
        }
    }
    
    // =============================================================================
    // Navigation Logic
    // =============================================================================
    
    scrollToSection(sectionId) {
        const section = this.elements.sections.find(s => s.id === sectionId);
        if (!section) {
            this.log('warn', `Section not found: ${sectionId}`);
            return;
        }
        
        this.log('debug', `Navigating to section: ${section.title} (${sectionId})`);
        
        // Интеграция с cursor play button
        this.handleCursorPlayButtonIntegration(sectionId);
        
        // Интеграция с hero cube
        this.handleHeroCubeIntegration(sectionId);
        
        // Устанавливаем флаг программного скролла
        this.state.isScrolling = true;
        
        // Очищаем предыдущий таймаут
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // Выполняем скролл
        this.performScroll(section);
        
        // Немедленно обновляем активную секцию
        this.setActiveSection(sectionId);
        
        // Добавляем визуальную обратную связь
        this.addClickFeedback(sectionId);
        
        this.emit('navigationStarted', { 
            targetSection: sectionId,
            sectionTitle: section.title
        });
    }
    
    performScroll(section) {
        if (this.state.lenisAvailable && this.options.lenisIntegration) {
            // Используем Lenis для плавного скролла
            window.app.lenis.scrollTo(section.element, {
                duration: this.options.scrollDuration,
                easing: this.options.scrollEasing,
                onComplete: () => {
                    this.state.isScrolling = false;
                    this.emit('navigationCompleted', { 
                        targetSection: section.id,
                        method: 'lenis'
                    });
                }
            });
        } else {
            // Fallback к нативному плавному скроллу
            section.element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Сбрасываем флаг через задержку (нативный скролл не имеет callback)
            this.scrollTimeout = setTimeout(() => {
                this.state.isScrolling = false;
                this.emit('navigationCompleted', { 
                    targetSection: section.id,
                    method: 'native'
                });
            }, this.options.scrollDuration * 1000 + 500);
        }
    }
    
    // =============================================================================
    // Integrations
    // =============================================================================
    
    checkIntegrations() {
        // Проверяем Lenis
        this.state.lenisAvailable = !!(window.app && window.app.lenis);
        
        // Проверяем Hero Cube
        this.state.heroCubeAvailable = !!(
            (window.app && window.app.heroCube) ||
            (document.getElementById('hero') && document.getElementById('hero').heroCubeInstance)
        );
        
        // Проверяем Cursor Play Button
        this.state.cursorPlayButtonAvailable = !!(window.cursorPlayButton);
        
        this.log('debug', 'Integrations checked', {
            lenis: this.state.lenisAvailable,
            heroCube: this.state.heroCubeAvailable,
            cursorPlayButton: this.state.cursorPlayButtonAvailable
        });
    }
    
    handleCursorPlayButtonIntegration(sectionId) {
        if (!this.options.cursorPlayButtonIntegration || !this.state.cursorPlayButtonAvailable) {
            return;
        }
        
        // Деактивируем магнитную кнопку при переходе к ЛЮБОЙ секции
        if (window.cursorPlayButton && window.cursorPlayButton.isActivated()) {
            this.log('debug', 'Деактивируем магнитную кнопку при переходе к секции:', sectionId);
            window.cursorPlayButton.deactivate();
            
            // Сбрасываем состояние hero-cube для корректной работы
            if (window.app && window.app.heroCube) {
                window.app.heroCube.playButtonActivated = false;
                this.log('debug', 'Сброшен флаг playButtonActivated в hero-cube');
            }
            
            this.emit('cursorPlayButtonDeactivated', { targetSection: sectionId });
        }
    }
    
    handleHeroCubeIntegration(sectionId) {
        if (!this.options.heroCubeIntegration || !this.state.heroCubeAvailable) {
            return;
        }
        
        this.log('debug', 'Section Navigation: Сброс состояния hero-cube при переходе к секции:', sectionId);
        this.resetHeroCubeState(sectionId);
    }
    
    resetHeroCubeState(sectionId) {
        // Ищем экземпляр hero-cube в глобальном приложении
        if (window.app && window.app.heroCube && typeof window.app.heroCube.resetVideoState === 'function') {
            this.log('debug', 'Section Navigation: Вызываем сброс состояния hero-cube с флагом навигации');
            window.app.heroCube.resetVideoState(true); // Передаем флаг навигации
            this.emit('heroCubeReset', { targetSection: sectionId, method: 'app' });
        } else {
            // Fallback: ищем hero-cube через DOM
            const heroElement = document.getElementById('hero');
            if (heroElement && heroElement.heroCubeInstance) {
                this.log('debug', 'Section Navigation: Вызываем сброс состояния hero-cube (fallback) с флагом навигации');
                heroElement.heroCubeInstance.resetVideoState(true); // Передаем флаг навигации
                this.emit('heroCubeReset', { targetSection: sectionId, method: 'dom' });
            } else {
                this.log('warn', 'Section Navigation: Hero-cube экземпляр не найден для сброса состояния');
            }
        }
    }
    
    // =============================================================================
    // Visual Feedback
    // =============================================================================
    
    addClickFeedback(sectionId) {
        const navItem = this.elements.navItems.find(item => item.dataset.section === sectionId);
        if (!navItem) return;
        
        const button = navItem.querySelector(this.options.navButtonSelector);
        if (!button) return;
        
        // Добавляем класс для анимации клика
        button.classList.add('clicked');
        
        // Убираем класс через короткое время
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
        
        this.emit('clickFeedback', { targetSection: sectionId });
        this.log('debug', 'Click feedback added for section:', sectionId);
    }
    
    // =============================================================================
    // Public API Methods
    // =============================================================================
    
    /**
     * Программный переход к секции
     */
    goToSection(sectionId) {
        this.scrollToSection(sectionId);
    }
    
    /**
     * Получить текущую активную секцию
     */
    getCurrentSection() {
        return this.state.currentActiveSection;
    }
    
    /**
     * Получить все секции
     */
    getSections() {
        return this.elements.sections.map(section => ({
            id: section.id,
            title: section.title
        }));
    }
    
    /**
     * Получить текущее состояние компонента
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            currentActiveSection: this.state.currentActiveSection,
            isScrolling: this.state.isScrolling,
            sectionsCount: this.elements.sections.length,
            lenisAvailable: this.state.lenisAvailable,
            heroCubeAvailable: this.state.heroCubeAvailable,
            cursorPlayButtonAvailable: this.state.cursorPlayButtonAvailable
        };
    }
    
    /**
     * Проверить доступность секции
     */
    hasSection(sectionId) {
        return this.elements.sections.some(section => section.id === sectionId);
    }
    
    /**
     * Получить следующую секцию
     */
    getNextSection() {
        const currentIndex = this.elements.sections.findIndex(
            section => section.id === this.state.currentActiveSection
        );
        
        if (currentIndex < this.elements.sections.length - 1) {
            return this.elements.sections[currentIndex + 1].id;
        }
        
        return null;
    }
    
    /**
     * Получить предыдущую секцию
     */
    getPreviousSection() {
        const currentIndex = this.elements.sections.findIndex(
            section => section.id === this.state.currentActiveSection
        );
        
        if (currentIndex > 0) {
            return this.elements.sections[currentIndex - 1].id;
        }
        
        return null;
    }
    
    // =============================================================================
    // Cleanup (BaseComponent)
    // =============================================================================
    
    destroy() {
        // Отключаем Intersection Observer
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
            this.sectionObserver = null;
        }
        
        // Очищаем таймауты
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }
        
        // Очищаем Lenis интеграцию
        if (this.state.lenisAvailable && window.app && window.app.lenis) {
            window.app.lenis.off('scroll', this.throttledUpdateActiveSection);
        }
        
        // Очищаем throttled функции
        this.throttledUpdateActiveSection = null;
        
        // Очищаем состояние
        this.state = {
            currentActiveSection: null,
            isScrolling: false,
            lastUpdate: 0,
            lenisAvailable: false,
            heroCubeAvailable: false,
            cursorPlayButtonAvailable: false
        };
        
        // Очищаем элементы
        this.elements = {
            navigation: null,
            navItems: [],
            sections: []
        };
        
        // Вызвать родительский destroy
        super.destroy();
        
        this.log('info', 'SectionNavigation component destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.SectionNavigation = SectionNavigation;
}

// Функция инициализации для совместимости
function initSectionNavigation() {
    return new SectionNavigation(document.body);
}

if (typeof window !== 'undefined') {
    window.initSectionNavigation = initSectionNavigation;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionNavigation;
}
