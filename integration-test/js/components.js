/* ===================================
   INTEGRATION TEST - COMPONENTS
   Используем правильную архитектуру из отдельных тестов
   =================================== */

// Header Component - использует AnimatedInteractiveComponent
class Header extends BaseComponent {
    constructor(element, options = {}) {
        super(element, {
            debug: true,
            throttle: 16,
            useAnimationService: true,
            ...options
        });
    }
    
    setupElements() {
        this.logo = this.element.querySelector('.header-logo');
        this.nav = this.element.querySelector('.header-nav');
        this.cta = this.element.querySelector('.header-cta');
        this.menuToggle = this.element.querySelector('.menu-toggle');
        this.navLinks = this.element.querySelectorAll('.nav-link');
    }
    
    bindEvents() {
        this.addEventListener(window, 'scroll', this.handleScroll.bind(this));
        if (this.cta) {
            this.addEventListener(this.cta, 'click', this.handleCTAClick.bind(this));
        }
        if (this.menuToggle) {
            this.addEventListener(this.menuToggle, 'click', this.toggleMobileMenu.bind(this));
        }
        
        // Smooth scroll для навигационных ссылок
        this.navLinks.forEach(link => {
            this.addEventListener(link, 'click', this.handleNavClick.bind(this));
        });
    }
    
    setupAnimations() {
        if (typeof gsap !== 'undefined') {
            // Анимация появления хедера
            gsap.fromTo(this.element, 
                { y: -100, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
            );
            
            // Анимация логотипа
            if (this.logo) {
                gsap.fromTo(this.logo,
                    { scale: 0, rotation: -180 },
                    { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.7)", delay: 0.3 }
                );
            }
        }
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        const shouldAddScrolled = scrollY > 100;
        
        if (shouldAddScrolled && !this.element.classList.contains('scrolled')) {
            this.element.classList.add('scrolled');
            if (typeof gsap !== 'undefined') {
                gsap.to(this.element, {
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    backdropFilter: 'blur(10px)',
                    duration: 0.3
                });
            }
        } else if (!shouldAddScrolled && this.element.classList.contains('scrolled')) {
            this.element.classList.remove('scrolled');
            if (typeof gsap !== 'undefined') {
                gsap.to(this.element, {
                    backgroundColor: 'transparent',
                    backdropFilter: 'none',
                    duration: 0.3
                });
            }
        }
    }
    
    handleCTAClick(e) {
        e.preventDefault();
        integrationTest.startTest();
        
        // Анимация клика
        if (typeof gsap !== 'undefined') {
            gsap.to(this.cta, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
        }
    }
    
    handleNavClick(e) {
        const href = e.currentTarget.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                integrationTest.addDebugLog(`Navigated to ${href}`, 'info');
            }
        }
    }
    
    toggleMobileMenu() {
        const isOpen = this.element.classList.contains('menu-open');
        
        if (isOpen) {
            this.element.classList.remove('menu-open');
        } else {
            this.element.classList.add('menu-open');
        }
        
        integrationTest.addDebugLog(`Mobile menu ${isOpen ? 'closed' : 'opened'}`, 'info');
    }
}

class Preloader extends BaseComponent {
    setupElements() {
        this.progressBar = this.element.querySelector('.preloader-progress-bar');
        this.percentage = this.element.querySelector('.preloader-percentage');
        this.text = this.element.querySelector('.preloader-text');
    }
    
    afterInit() {
        this.startLoading();
    }
    
    startLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.hide(), 500);
            }
            
            if (this.progressBar) {
                this.progressBar.style.width = `${progress}%`;
            }
            if (this.percentage) {
                this.percentage.textContent = `${Math.round(progress)}%`;
            }
        }, 200);
    }
    
    hide() {
        this.element.classList.add('hidden');
        setTimeout(() => {
            this.element.style.display = 'none';
        }, 500);
    }
}

// HeroCube - использует правильную архитектуру с микросервисами
class HeroCube extends BaseComponent {
    constructor(element, options = {}) {
        super(element, {
            debug: true,
            throttle: 16,
            useAnimationService: true,
            ...options
        });
        
        // Попытка использовать HeroCubeController если доступен
        this.heroCubeController = null;
        this.fallbackMode = false;
    }
    
    setupElements() {
        this.cube = this.element.querySelector('.hero-cube');
        this.cubeContainer = this.element.querySelector('.hero-cube-container');
        this.square = this.element.querySelector('.hero-square');
        this.video = this.element.querySelector('.hero-video');
        
        // Попытка создать HeroCubeController
        if (typeof HeroCubeController !== 'undefined') {
            try {
                this.heroCubeController = new HeroCubeController(this.element);
                integrationTest.addDebugLog('HeroCubeController initialized successfully', 'success');
                return true;
            } catch (error) {
                console.warn('Failed to initialize HeroCubeController, using fallback:', error);
                this.fallbackMode = true;
            }
        } else {
            console.warn('HeroCubeController not available, using fallback mode');
            this.fallbackMode = true;
        }
        
        return this.cube && this.square && this.video;
    }
    
    setupAnimations() {
        if (!this.fallbackMode && this.heroCubeController) {
            // HeroCubeController handles all animations
            integrationTest.addDebugLog('Using HeroCubeController for animations', 'info');
            return;
        }
        
        // Fallback animations
        this.setupFallbackAnimations();
    }
    
    setupFallbackAnimations() {
        if (typeof gsap !== 'undefined' && this.cube) {
            integrationTest.addDebugLog('Using fallback cube animations', 'warn');
            
            // Enhanced cube rotation with scroll interaction
            gsap.to(this.cube, {
                rotationY: 360,
                rotationX: 360,
                duration: 20,
                repeat: -1,
                ease: "none"
            });
            
            // Scroll-based interactions
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.create({
                    trigger: this.element,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => this.activateInteractions(),
                    onLeave: () => this.deactivateInteractions()
                });
            }
        }
    }
    
    bindEvents() {
        if (!this.fallbackMode && this.heroCubeController) {
            // HeroCubeController handles all events
            return;
        }
        
        // Fallback event handling
        this.activateInteractions();
    }
    
    activateInteractions() {
        if (this.cube) {
            this.addEventListener(this.cube, 'click', this.switchToSquare.bind(this));
        }
    }
    
    deactivateInteractions() {
        // Interactions are automatically removed by destroy method
    }
    
    switchToSquare() {
        if (typeof gsap !== 'undefined') {
            gsap.to(this.cube, { opacity: 0, duration: 0.5 });
            gsap.to(this.square, { opacity: 1, duration: 0.5 });
            
            setTimeout(() => this.showVideo(), 1000);
            
            integrationTest.addDebugLog('Cube switched to square (fallback mode)', 'info');
        }
    }
    
    showVideo() {
        if (typeof gsap !== 'undefined' && this.video) {
            gsap.to(this.video, { opacity: 1, duration: 0.5 });
            integrationTest.addDebugLog('Video shown (fallback mode)', 'info');
        }
    }
    
    // Proxy methods to HeroCubeController if available
    rotateTo(x, y, duration = 1) {
        if (this.heroCubeController && typeof this.heroCubeController.rotateTo === 'function') {
            this.heroCubeController.rotateTo(x, y, duration);
        } else {
            integrationTest.addDebugLog('rotateTo not available in fallback mode', 'warn');
        }
    }
    
    reset(duration = 1) {
        if (this.heroCubeController && typeof this.heroCubeController.reset === 'function') {
            this.heroCubeController.reset(duration);
        } else {
            // Fallback reset
            if (typeof gsap !== 'undefined') {
                if (this.cube) {
                    gsap.to(this.cube, { opacity: 1, rotationX: 0, rotationY: 0, duration });
                }
                if (this.square) {
                    gsap.to(this.square, { opacity: 0, duration });
                }
                if (this.video) {
                    gsap.to(this.video, { opacity: 0, duration });
                }
            }
            integrationTest.addDebugLog('Hero cube reset (fallback mode)', 'info');
        }
    }
    
    getState() {
        if (this.heroCubeController && typeof this.heroCubeController.getState === 'function') {
            return this.heroCubeController.getState();
        }
        
        // Fallback state
        return {
            fallbackMode: true,
            cubeVisible: this.cube ? this.cube.style.opacity !== '0' : false,
            squareVisible: this.square ? this.square.style.opacity === '1' : false,
            videoVisible: this.video ? this.video.style.opacity === '1' : false,
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed
        };
    }
    
    destroy() {
        if (this.heroCubeController && typeof this.heroCubeController.destroy === 'function') {
            this.heroCubeController.destroy();
            this.heroCubeController = null;
        }
        
        super.destroy();
        integrationTest.addDebugLog('Hero cube destroyed', 'info');
    }
}

class HeroStarsScroll extends BaseComponent {
    setupElements() {
        this.starsAnimation = this.element.querySelector('.hero-stars-animation');
        this.layers = this.element.querySelectorAll('[class*="hero-stars-layer"]');
    }
    
    bindEvents() {
        this.addEventListener(window, 'scroll', this.handleScroll.bind(this));
        this.addEventListener(window, 'resize', this.handleResize.bind(this));
    }
    
    setupAnimations() {
        this.updateColors();
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        const progress = Math.min(scrollY / window.innerHeight, 1);
        
        this.updateColors(progress);
    }
    
    handleResize() {
        this.updateColors();
    }
    
    updateColors(progress = 0) {
        if (!this.starsAnimation) return;
        
        const colors = this.interpolateColors(progress);
        
        this.starsAnimation.style.setProperty('--gradient-1-color', colors.gradient1);
        this.starsAnimation.style.setProperty('--gradient-2-color', colors.gradient2);
        this.starsAnimation.style.setProperty('--gradient-3-color', colors.gradient3);
        this.starsAnimation.style.setProperty('--base-color', colors.base);
    }
    
    interpolateColors(progress) {
        const startColors = {
            gradient1: 'rgba(80, 11, 169, 0.4)',
            gradient2: 'rgba(192, 113, 224, 0.25)',
            gradient3: 'rgba(8, 4, 10, 0.25)',
            base: '#000000'
        };
        
        const endColors = {
            gradient1: 'rgba(169, 11, 80, 0.4)',
            gradient2: 'rgba(224, 113, 192, 0.25)',
            gradient3: 'rgba(10, 4, 8, 0.25)',
            base: '#001122'
        };
        
        return {
            gradient1: this.lerpColor(startColors.gradient1, endColors.gradient1, progress),
            gradient2: this.lerpColor(startColors.gradient2, endColors.gradient2, progress),
            gradient3: this.lerpColor(startColors.gradient3, endColors.gradient3, progress),
            base: this.lerpColor(startColors.base, endColors.base, progress)
        };
    }
    
    lerpColor(color1, color2, t) {
        // Simple color interpolation (for demo purposes)
        return t > 0.5 ? color2 : color1;
    }
}

class FutureMarketing extends BaseComponent {
    setupElements() {
        this.spacer = this.element.querySelector('.future-cards-spacer');
        this.viewer = this.element.querySelector('.future-cards-viewer');
        this.track = this.element.querySelector('.future-cards-track');
        this.cards = this.element.querySelectorAll('.future-card');
    }
    
    bindEvents() {
        this.cards.forEach(card => {
            this.addEventListener(card, 'mouseenter', this.handleCardHover.bind(this));
            this.addEventListener(card, 'mouseleave', this.handleCardLeave.bind(this));
        });
    }
    
    setupAnimations() {
        if (typeof gsap !== 'undefined' && this.track) {
            // Pause animation on hover
            this.track.addEventListener('mouseenter', () => {
                this.track.style.animationPlayState = 'paused';
            });
            
            this.track.addEventListener('mouseleave', () => {
                this.track.style.animationPlayState = 'running';
            });
        }
    }
    
    handleCardHover(e) {
        if (typeof gsap !== 'undefined') {
            gsap.to(e.currentTarget, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }
    
    handleCardLeave(e) {
        if (typeof gsap !== 'undefined') {
            gsap.to(e.currentTarget, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }
}

class CaseStudies extends BaseComponent {
    setupElements() {
        this.container = this.element.querySelector('.horizontal-scroll-container');
        this.wrapper = this.element.querySelector('.slides-wrapper');
        this.slides = this.element.querySelectorAll('.slide');
    }
    
    bindEvents() {
        this.slides.forEach(slide => {
            this.addEventListener(slide, 'click', this.handleSlideClick.bind(this));
        });
    }
    
    handleSlideClick(e) {
        const slide = e.currentTarget;
        const firmName = slide.querySelector('.firm-name')?.textContent || 'Unknown';
        
        integrationTest.addDebugLog(`Clicked on case study: ${firmName}`, 'info');
        
        if (typeof gsap !== 'undefined') {
            gsap.to(slide, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
        }
    }
}

class Services extends BaseComponent {
    setupElements() {
        this.viewer = this.element.querySelector('.js-cards-viewer');
        this.cardsList = this.element.querySelector('.js-cards-list');
        this.cards = this.element.querySelectorAll('.js-card');
        this.counter = this.element.querySelector('.card-counter');
    }
    
    bindEvents() {
        this.cards.forEach((card, index) => {
            this.addEventListener(card, 'click', () => this.handleCardClick(card, index));
            this.addEventListener(card, 'mouseenter', () => this.handleCardHover(card));
        });
    }
    
    handleCardClick(card, index) {
        const serviceId = card.dataset.serviceId || `service-${index + 1}`;
        integrationTest.addDebugLog(`Clicked on service: ${serviceId}`, 'info');
        
        if (typeof gsap !== 'undefined') {
            gsap.to(card, {
                rotationY: 360,
                duration: 0.8,
                ease: "power2.inOut"
            });
        }
    }
    
    handleCardHover(card) {
        if (typeof gsap !== 'undefined') {
            gsap.to(card, {
                y: -15,
                scale: 1.03,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }
}

class Portfolio extends BaseComponent {
    setupElements() {
        this.filters = this.element.querySelectorAll('.portfolio-filter');
        this.items = this.element.querySelectorAll('.portfolio-item');
        this.grid = this.element.querySelector('.portfolio-grid');
    }
    
    bindEvents() {
        this.filters.forEach(filter => {
            this.addEventListener(filter, 'click', () => this.handleFilterClick(filter));
        });
        
        this.items.forEach(item => {
            this.addEventListener(item, 'click', () => this.handleItemClick(item));
        });
    }
    
    handleFilterClick(filter) {
        // Remove active class from all filters
        this.filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
        
        const filterValue = filter.dataset.filter;
        this.filterItems(filterValue);
        
        integrationTest.addDebugLog(`Portfolio filtered by: ${filterValue}`, 'info');
    }
    
    filterItems(filter) {
        this.items.forEach(item => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (typeof gsap !== 'undefined') {
                if (shouldShow) {
                    gsap.to(item, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.3,
                        display: 'block'
                    });
                } else {
                    gsap.to(item, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.3,
                        onComplete: () => {
                            item.style.display = 'none';
                        }
                    });
                }
            } else {
                item.style.display = shouldShow ? 'block' : 'none';
            }
        });
    }
    
    handleItemClick(item) {
        const title = item.querySelector('.portfolio-item-title')?.textContent || 'Unknown';
        integrationTest.addDebugLog(`Clicked on portfolio item: ${title}`, 'info');
        
        if (typeof gsap !== 'undefined') {
            gsap.to(item, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
        }
    }
}

class Footer extends BaseComponent {
    setupElements() {
        this.socialLinks = this.element.querySelectorAll('.social-link');
        this.footerLinks = this.element.querySelectorAll('.footer-column a');
    }
    
    bindEvents() {
        this.socialLinks.forEach(link => {
            this.addEventListener(link, 'click', this.handleSocialClick.bind(this));
        });
        
        this.footerLinks.forEach(link => {
            this.addEventListener(link, 'click', this.handleFooterLinkClick.bind(this));
        });
    }
    
    handleSocialClick(e) {
        e.preventDefault();
        const platform = e.currentTarget.textContent;
        integrationTest.addDebugLog(`Social link clicked: ${platform}`, 'info');
    }
    
    handleFooterLinkClick(e) {
        e.preventDefault();
        const linkText = e.currentTarget.textContent;
        integrationTest.addDebugLog(`Footer link clicked: ${linkText}`, 'info');
    }
}

class ScrollToTop extends BaseComponent {
    setupElements() {
        this.button = this.element.querySelector('.scroll-to-top-btn');
    }
    
    bindEvents() {
        this.addEventListener(window, 'scroll', this.handleScroll.bind(this));
        if (this.button) {
            this.addEventListener(this.button, 'click', this.scrollToTop.bind(this));
        }
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        const shouldShow = scrollY > 300;
        
        if (shouldShow) {
            this.element.classList.add('visible');
        } else {
            this.element.classList.remove('visible');
        }
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        integrationTest.addDebugLog('Scrolled to top', 'info');
    }
}

class SectionNavigation extends BaseComponent {
    setupElements() {
        this.dots = this.element.querySelectorAll('.section-navigation-dot');
        this.sections = document.querySelectorAll('.section');
    }
    
    bindEvents() {
        this.dots.forEach((dot, index) => {
            this.addEventListener(dot, 'click', () => this.navigateToSection(index));
        });
        
        this.addEventListener(window, 'scroll', this.updateActiveDot.bind(this));
    }
    
    navigateToSection(index) {
        const section = this.sections[index];
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            integrationTest.addDebugLog(`Navigated to section: ${section.id || index}`, 'info');
        }
    }
    
    updateActiveDot() {
        const scrollY = window.scrollY + window.innerHeight / 2;
        
        let activeIndex = 0;
        this.sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                activeIndex = index;
            }
        });
        
        this.dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

class WordAnimator extends BaseComponent {
    setupElements() {
        this.textElements = this.element.querySelectorAll('[data-text]');
    }
    
    setupAnimations() {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            this.textElements.forEach(element => {
                ScrollTrigger.create({
                    trigger: element,
                    start: "top 80%",
                    onEnter: () => this.animateText(element)
                });
            });
        }
    }
    
    animateText(element) {
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(element, 
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
        }
    }
}

class CursorPlayButton extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
        console.log('🎬 CursorPlayButton initialized');
    }
    
    bindEvents() {
        this.addEventListener(document, 'mousemove', this.handleMouseMove.bind(this));
    }
    
    handleMouseMove(e) {
        // Simple cursor tracking for demo
        const cursor = document.querySelector('.custom-cursor');
        if (cursor) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    }
}

// Export for global access
window.Header = Header;
window.Preloader = Preloader;
window.HeroCube = HeroCube;
window.HeroStarsScroll = HeroStarsScroll;
window.FutureMarketing = FutureMarketing;
window.CaseStudies = CaseStudies;
window.Services = Services;
window.Portfolio = Portfolio;
window.Footer = Footer;
window.ScrollToTop = ScrollToTop;
window.SectionNavigation = SectionNavigation;
window.WordAnimator = WordAnimator;
window.CursorPlayButton = CursorPlayButton;
