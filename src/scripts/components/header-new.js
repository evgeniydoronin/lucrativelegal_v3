// =============================================================================
// Header Component - Refactored Version
// =============================================================================

/**
 * Header Navigation Component
 * Включает scroll-based поведение, dropdown меню и offcanvas
 * 
 * Использует:
 * - AnimatedInteractiveComponent для базовой архитектуры
 * - Прямые GSAP вызовы для анимаций (без AnimationService)
 * - Правильный lifecycle и cleanup
 * - Fallback анимации для случаев без GSAP
 */

class Header extends AnimatedInteractiveComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Scroll поведение
            scrollThreshold: 50,
            scrollDebounce: 10,
            
            // Анимации
            logoSwitchDuration: 0.3,
            dropdownDuration: 0.3,
            offcanvasDuration: 0.4,
            
            // Offcanvas
            closeOnResize: true,
            closeOnEscape: true,
            
            // Debug
            debug: false
        };
    }
    
    // =============================================================================
    // Lifecycle Methods (BaseComponent)
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Состояние компонента (НЕ глобальные переменные!)
        this.state = {
            isOffcanvasOpen: false,
            lastScrollY: 0,
            isScrolled: false,
            currentLogo: 'white' // 'white' | 'black'
        };
        
        // Элементы (будут найдены в setupElements)
        this.elements = {
            header: null,
            logoWhite: null,
            logoBlack: null,
            nav: null,
            dropdownItems: [],
            offcanvasBtn: null,
            offcanvasCloseBtn: null,
            offcanvas: null,
            overlay: null,
            mobileMenuItems: [],
            navLinks: []
        };
        
        // Анимации
        this.logoSwitchTimeline = null;
        
        this.log('debug', 'Header beforeInit - конфигурация готова');
        return true;
    }
    
    setupElements() {
        // Основные элементы
        this.elements.header = this.element;
        this.elements.logoWhite = this.element.querySelector('.header__logo-white');
        this.elements.logoBlack = this.element.querySelector('.header__logo-black');
        this.elements.nav = this.element.querySelector('.header__nav');
        
        // Dropdown элементы
        this.elements.dropdownItems = Array.from(
            this.element.querySelectorAll('.header__nav .has-dropdown')
        );
        
        // Offcanvas элементы
        this.elements.offcanvasBtn = this.element.querySelector('.header__offcanvas-open-btn');
        this.elements.offcanvasCloseBtn = this.element.querySelector('.header__offcanvas-close-btn');
        this.elements.offcanvas = this.element.querySelector('.header__offcanvas-area');
        this.elements.overlay = document.querySelector('.body-overlay');
        
        // Мобильное меню
        this.elements.mobileMenuItems = Array.from(
            this.element.querySelectorAll('.header__mobile-menu .has-dropdown')
        );
        
        // Навигационные ссылки
        this.elements.navLinks = Array.from(
            this.element.querySelectorAll('.header__nav a[href^="#"], .header__mobile-menu a[href^="#"]')
        );
        
        // Валидация критических элементов
        if (!this.elements.header) {
            this.log('error', 'Header element not found');
            return false;
        }
        
        this.log('info', 'Header elements found', {
            dropdowns: this.elements.dropdownItems.length,
            mobileItems: this.elements.mobileMenuItems.length,
            navLinks: this.elements.navLinks.length
        });
        
        return true;
    }
    
    bindEvents() {
        // Scroll поведение через BaseComponent throttle
        this.addEventHandler(window, 'scroll', 
            this.throttle(this.handleScroll.bind(this), this.options.scrollDebounce)
        );
        
        // Offcanvas события
        if (this.elements.offcanvasBtn) {
            this.addEventHandler(this.elements.offcanvasBtn, 'click', 
                this.openOffcanvas.bind(this)
            );
        }
        
        if (this.elements.offcanvasCloseBtn) {
            this.addEventHandler(this.elements.offcanvasCloseBtn, 'click', 
                this.closeOffcanvas.bind(this)
            );
        }
        
        if (this.elements.overlay) {
            this.addEventHandler(this.elements.overlay, 'click', 
                this.closeOffcanvas.bind(this)
            );
        }
        
        // Keyboard события
        if (this.options.closeOnEscape) {
            this.addEventHandler(document, 'keydown', this.handleKeydown.bind(this));
        }
        
        // Resize события
        if (this.options.closeOnResize) {
            this.addEventHandler(window, 'resize', 
                this.debounce(this.handleResize.bind(this), 250)
            );
        }
        
        // Dropdown события
        this.bindDropdownEvents();
        
        // Мобильное меню события
        this.bindMobileMenuEvents();
        
        // Smooth navigation
        this.bindNavigationEvents();
        
        // Закрытие dropdown при клике вне меню
        this.addEventHandler(document, 'click', this.handleDocumentClick.bind(this));
        
        this.log('debug', 'Header events bound');
    }
    
    setupAnimations() {
        // Получаем AnimationService
        this.animationService = window.AnimationService?.getInstance();
        
        if (!this.animationService) {
            this.log('warn', 'AnimationService not available, using fallback animations');
            this.setupAnimationsFallback();
            return;
        }
        
        // Анимация появления header при загрузке
        this.createInitialAnimations();
        
        this.log('info', 'Header animations setup completed');
    }
    
    setupAnimationsFallback() {
        // Fallback анимации без AnimationService
        this.log('info', 'Using fallback animations without AnimationService');
    }
    
    afterInit() {
        // Установить начальное состояние scroll
        this.updateScrollState(window.scrollY, false);
        
        this.log('info', 'Header component fully initialized', {
            scrollThreshold: this.options.scrollThreshold,
            currentLogo: this.state.currentLogo,
            isScrolled: this.state.isScrolled
        });
    }
    
    // =============================================================================
    // Event Handlers
    // =============================================================================
    
    handleScroll() {
        const currentScrollY = window.scrollY;
        this.updateScrollState(currentScrollY, true);
        this.state.lastScrollY = currentScrollY;
    }
    
    handleKeydown(event) {
        if (event.key === 'Escape' && this.state.isOffcanvasOpen) {
            this.closeOffcanvas();
        }
    }
    
    handleResize() {
        if (window.innerWidth > 767 && this.state.isOffcanvasOpen) {
            this.closeOffcanvas();
        }
    }
    
    handleDocumentClick(event) {
        if (!event.target.closest('.header__nav')) {
            this.closeAllDropdowns();
        }
    }
    
    // =============================================================================
    // Scroll Behavior
    // =============================================================================
    
    updateScrollState(scrollY, animate = true) {
        const isScrolled = scrollY > this.options.scrollThreshold;
        
        if (this.state.isScrolled === isScrolled) return;
        
        this.state.isScrolled = isScrolled;
        
        if (isScrolled) {
            this.elements.header.classList.remove('header--transparent');
            this.elements.header.classList.add('header--scrolled');
            this.switchLogo('black', animate);
        } else {
            this.elements.header.classList.add('header--transparent');
            this.elements.header.classList.remove('header--scrolled');
            this.switchLogo('white', animate);
        }
        
        this.emit('scrollStateChanged', { isScrolled, scrollY });
    }
    
    switchLogo(targetLogo, animate = true) {
        if (this.state.currentLogo === targetLogo) return;
        
        const fromLogo = targetLogo === 'black' ? this.elements.logoWhite : this.elements.logoBlack;
        const toLogo = targetLogo === 'black' ? this.elements.logoBlack : this.elements.logoWhite;
        
        if (!fromLogo || !toLogo) return;
        
        this.state.currentLogo = targetLogo;
        
        if (animate && window.gsap) {
            // Используем прямые GSAP вызовы
            gsap.to(fromLogo, { 
                opacity: 0, 
                duration: this.options.logoSwitchDuration / 2,
                onComplete: () => {
                    fromLogo.style.display = 'none';
                    toLogo.style.display = 'block';
                    toLogo.style.opacity = '0';
                    gsap.to(toLogo, { 
                        opacity: 1, 
                        duration: this.options.logoSwitchDuration / 2 
                    });
                }
            });
        } else {
            // Fallback без анимации
            fromLogo.style.display = 'none';
            toLogo.style.display = 'block';
            toLogo.style.opacity = '1';
        }
        
        this.log('debug', `Logo switched to ${targetLogo}`);
    }
    
    // =============================================================================
    // Dropdown Menu
    // =============================================================================
    
    bindDropdownEvents() {
        this.elements.dropdownItems.forEach(item => {
            const submenu = item.querySelector('.header__submenu');
            if (!submenu) return;
            
            let hoverTimeout;
            
            // Показать dropdown при hover
            this.addEventHandler(item, 'mouseenter', () => {
                clearTimeout(hoverTimeout);
                this.showDropdown(submenu);
            });
            
            // Скрыть dropdown при уходе мыши
            this.addEventHandler(item, 'mouseleave', () => {
                hoverTimeout = setTimeout(() => {
                    this.hideDropdown(submenu);
                }, 100);
            });
            
            // Обработка вложенных dropdown
            this.bindNestedDropdowns(item);
        });
    }
    
    bindNestedDropdowns(parentItem) {
        const nestedDropdowns = parentItem.querySelectorAll('.menu-item-has-children');
        
        nestedDropdowns.forEach(nestedItem => {
            const nestedSubmenu = nestedItem.querySelector('.header__submenu');
            if (!nestedSubmenu) return;
            
            let nestedTimeout;
            
            this.addEventHandler(nestedItem, 'mouseenter', () => {
                clearTimeout(nestedTimeout);
                this.showDropdown(nestedSubmenu, 'horizontal');
            });
            
            this.addEventHandler(nestedItem, 'mouseleave', () => {
                nestedTimeout = setTimeout(() => {
                    this.hideDropdown(nestedSubmenu, 'horizontal');
                }, 100);
            });
        });
    }
    
    showDropdown(submenu, direction = 'vertical') {
        if (window.gsap) {
            const fromVars = direction === 'horizontal' 
                ? { opacity: 0, x: -10 }
                : { opacity: 0, y: -10, scale: 0.95 };
                
            const toVars = direction === 'horizontal'
                ? { opacity: 1, x: 0 }
                : { opacity: 1, y: 0, scale: 1 };
            
            submenu.style.display = 'block';
            gsap.fromTo(submenu, fromVars, {
                ...toVars,
                duration: this.options.dropdownDuration,
                ease: "power2.out"
            });
        } else {
            submenu.style.display = 'block';
            submenu.classList.add('show');
        }
    }
    
    hideDropdown(submenu, direction = 'vertical') {
        if (window.gsap) {
            const toVars = direction === 'horizontal'
                ? { opacity: 0, x: -10 }
                : { opacity: 0, y: -10, scale: 0.95 };
            
            gsap.to(submenu, {
                ...toVars,
                duration: this.options.dropdownDuration / 2,
                ease: "power2.in",
                onComplete: () => {
                    submenu.style.display = 'none';
                }
            });
        } else {
            submenu.classList.remove('show');
            setTimeout(() => {
                submenu.style.display = 'none';
            }, 200);
        }
    }
    
    closeAllDropdowns() {
        const openDropdowns = this.element.querySelectorAll('.header__submenu[style*="block"]');
        openDropdowns.forEach(dropdown => {
            this.hideDropdown(dropdown);
        });
    }
    
    // =============================================================================
    // Offcanvas Menu
    // =============================================================================
    
    openOffcanvas() {
        if (this.state.isOffcanvasOpen) return;
        
        this.state.isOffcanvasOpen = true;
        
        if (window.gsap) {
            const timeline = gsap.timeline();
            
            timeline
                .set([this.elements.offcanvas, this.elements.overlay], { display: 'block' })
                .fromTo(this.elements.overlay, 
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3 }
                )
                .fromTo(this.elements.offcanvas, 
                    { x: '100%' },
                    { x: '0%', duration: this.options.offcanvasDuration, ease: "power2.out" },
                    "-=0.1"
                )
                .fromTo('.header__offcanvas-content, .header__offcanvas-menu, .header__offcanvas-contact, .header__offcanvas-social',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 },
                    "-=0.2"
                );
        } else {
            this.elements.offcanvas.classList.add('open');
            this.elements.overlay.classList.add('active');
        }
        
        document.body.style.overflow = 'hidden';
        this.animateHamburger(true);
        
        this.emit('offcanvasOpened');
        this.log('debug', 'Offcanvas opened');
    }
    
    closeOffcanvas() {
        if (!this.state.isOffcanvasOpen) return;
        
        this.state.isOffcanvasOpen = false;
        
        if (window.gsap) {
            const timeline = gsap.timeline();
            
            timeline
                .to('.header__offcanvas-content, .header__offcanvas-menu, .header__offcanvas-contact, .header__offcanvas-social',
                    { opacity: 0, y: -20, duration: 0.2, stagger: 0.05 }
                )
                .to(this.elements.offcanvas, 
                    { x: '100%', duration: 0.3, ease: "power2.in" },
                    "-=0.1"
                )
                .to(this.elements.overlay, 
                    { opacity: 0, duration: 0.2 },
                    "-=0.2"
                )
                .set([this.elements.offcanvas, this.elements.overlay], { display: 'none' });
        } else {
            this.elements.offcanvas.classList.remove('open');
            this.elements.overlay.classList.remove('active');
        }
        
        document.body.style.overflow = '';
        this.animateHamburger(false);
        
        this.emit('offcanvasClosed');
        this.log('debug', 'Offcanvas closed');
    }
    
    animateHamburger(isOpen) {
        const lines = this.elements.offcanvasBtn?.querySelectorAll('i');
        if (!lines || lines.length !== 3) return;
        
        if (window.gsap) {
            if (isOpen) {
                gsap.to(lines[0], { rotation: 45, y: 6, duration: 0.3 });
                gsap.to(lines[1], { opacity: 0, duration: 0.2 });
                gsap.to(lines[2], { rotation: -45, y: -6, duration: 0.3 });
            } else {
                gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3 });
                gsap.to(lines[1], { opacity: 1, duration: 0.2 });
                gsap.to(lines[2], { rotation: 0, y: 0, duration: 0.3 });
            }
        } else {
            // Fallback
            if (isOpen) {
                lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                lines[1].style.opacity = '0';
                lines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                lines[0].style.transform = 'none';
                lines[1].style.opacity = '1';
                lines[2].style.transform = 'none';
            }
        }
    }
    
    // =============================================================================
    // Mobile Menu
    // =============================================================================
    
    bindMobileMenuEvents() {
        this.elements.mobileMenuItems.forEach(item => {
            const link = item.querySelector(':scope > a');
            const submenu = item.querySelector('.header__mobile-submenu');
            
            if (!link || !submenu) return;
            
            // Добавляем индикатор dropdown
            const indicator = this.createMobileIndicator();
            link.appendChild(indicator);
            
            // Скрываем submenu по умолчанию
            submenu.style.display = 'none';
            
            // Обработчик клика
            this.addEventHandler(link, 'click', (event) => {
                event.preventDefault();
                this.toggleMobileSubmenu(item, submenu, indicator);
            });
            
            // Обработка вложенных submenu
            this.bindNestedMobileMenu(submenu);
        });
    }
    
    createMobileIndicator() {
        const indicator = document.createElement('span');
        indicator.innerHTML = '+';
        indicator.style.cssText = 'float: right; cursor: pointer; font-size: 18px; line-height: 1; transition: transform 0.3s;';
        return indicator;
    }
    
    toggleMobileSubmenu(item, submenu, indicator) {
        const isOpen = submenu.style.display === 'block';
        
        // Закрываем все другие submenu
        this.closeAllMobileSubmenus(submenu);
        
        if (isOpen) {
            this.closeMobileSubmenu(submenu, indicator);
        } else {
            this.openMobileSubmenu(submenu, indicator);
        }
    }
    
    openMobileSubmenu(submenu, indicator) {
        submenu.style.display = 'block';
        
        if (window.gsap) {
            gsap.fromTo(submenu, 
                { height: 0, opacity: 0 },
                { height: 'auto', opacity: 1, duration: 0.3 }
            );
            gsap.to(indicator, { rotation: 45, duration: 0.3 });
        }
        
        indicator.innerHTML = '−';
    }
    
    closeMobileSubmenu(submenu, indicator) {
        if (window.gsap) {
            gsap.to(submenu, {
                height: 0, 
                opacity: 0, 
                duration: 0.3,
                onComplete: () => {
                    submenu.style.display = 'none';
                }
            });
            gsap.to(indicator, { rotation: 0, duration: 0.3 });
        } else {
            submenu.style.display = 'none';
        }
        
        indicator.innerHTML = '+';
    }
    
    closeAllMobileSubmenus(except = null) {
        this.elements.mobileMenuItems.forEach(item => {
            const submenu = item.querySelector('.header__mobile-submenu');
            const indicator = item.querySelector(':scope > a span');
            
            if (submenu && submenu !== except && submenu.style.display === 'block') {
                this.closeMobileSubmenu(submenu, indicator);
            }
        });
    }
    
    bindNestedMobileMenu(parentSubmenu) {
        const nestedItems = parentSubmenu.querySelectorAll('.menu-item-has-children');
        
        nestedItems.forEach(nestedItem => {
            const nestedLink = nestedItem.querySelector(':scope > a');
            const nestedSubmenu = nestedItem.querySelector('.header__mobile-submenu');
            
            if (!nestedLink || !nestedSubmenu) return;
            
            const nestedIndicator = this.createMobileIndicator();
            nestedIndicator.style.fontSize = '16px';
            nestedLink.appendChild(nestedIndicator);
            
            nestedSubmenu.style.display = 'none';
            
            this.addEventHandler(nestedLink, 'click', (event) => {
                event.preventDefault();
                this.toggleMobileSubmenu(nestedItem, nestedSubmenu, nestedIndicator);
            });
        });
    }
    
    // =============================================================================
    // Smooth Navigation
    // =============================================================================
    
    bindNavigationEvents() {
        this.elements.navLinks.forEach(link => {
            this.addEventHandler(link, 'click', (event) => {
                event.preventDefault();
                this.handleSmoothNavigation(link);
            });
        });
    }
    
    handleSmoothNavigation(link) {
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (!targetElement) return;
        
        const headerHeight = this.elements.header.offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        if (window.gsap && window.ScrollToPlugin) {
            gsap.to(window, {
                scrollTo: { y: targetPosition, autoKill: false },
                duration: 1,
                ease: "power2.inOut"
            });
        } else {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
        
        // Закрываем offcanvas если открыт
        if (this.state.isOffcanvasOpen) {
            this.closeOffcanvas();
        }
        
        this.emit('navigationClicked', { targetId, targetElement });
    }
    
    // =============================================================================
    // Initial Animations
    // =============================================================================
    
    createInitialAnimations() {
        if (!window.gsap) return;
        
        // Анимация появления header при загрузке
        gsap.fromTo(this.elements.header, 
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
        );
        
        // Анимация логотипа при загрузке
        const logoImg = this.elements.header.querySelector('.header__logo img');
        if (logoImg) {
            gsap.fromTo(logoImg, 
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.4 }
            );
        }
        
        // Анимация навигационных элементов
        const navItems = this.elements.header.querySelectorAll('.header__nav nav ul li');
        if (navItems.length > 0) {
            gsap.fromTo(navItems, 
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.6 }
            );
        }
        
        // Анимация кнопки
        const btnBox = this.elements.header.querySelector('.header__btn-box');
        if (btnBox) {
            gsap.fromTo(btnBox, 
                { x: 20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.8 }
            );
        }
    }
    
    // =============================================================================
    // Public API Methods
    // =============================================================================
    
    /**
     * Получить текущее состояние header
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            isOffcanvasOpen: this.state.isOffcanvasOpen,
            isScrolled: this.state.isScrolled,
            currentLogo: this.state.currentLogo,
            lastScrollY: this.state.lastScrollY
        };
    }
    
    /**
     * Программно закрыть offcanvas
     */
    closeOffcanvasMenu() {
        if (this.state.isOffcanvasOpen) {
            this.closeOffcanvas();
        }
    }
    
    /**
     * Скролл к верху страницы
     */
    scrollToTop() {
        if (window.gsap && window.ScrollToPlugin) {
            gsap.to(window, {
                scrollTo: { y: 0, autoKill: false },
                duration: 1,
                ease: "power2.inOut"
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Принудительно обновить состояние header
     */
    updateHeaderState() {
        this.updateScrollState(window.scrollY, false);
    }
    
    // =============================================================================
    // Cleanup (BaseComponent)
    // =============================================================================
    
    destroy() {
        // Закрыть offcanvas если открыт
        if (this.state.isOffcanvasOpen) {
            this.closeOffcanvas();
        }
        
        // Восстановить overflow body
        document.body.style.overflow = '';
        
        // Очистить состояние
        this.state = {
            isOffcanvasOpen: false,
            lastScrollY: 0,
            isScrolled: false,
            currentLogo: 'white'
        };
        
        // Очистить элементы
        this.elements = {
            header: null,
            logoWhite: null,
            logoBlack: null,
            nav: null,
            dropdownItems: [],
            offcanvasBtn: null,
            offcanvasCloseBtn: null,
            offcanvas: null,
            overlay: null,
            mobileMenuItems: [],
            navLinks: []
        };
        
        // Очистить анимации
        this.logoSwitchTimeline = null;
        
        // Вызвать родительский destroy
        super.destroy();
        
        this.log('info', 'Header component destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.Header = Header;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Header;
}
