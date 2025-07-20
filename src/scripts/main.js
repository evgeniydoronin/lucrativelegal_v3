// =============================================================================
// LLG Design System - Main JavaScript
// =============================================================================

// 🚨 PRODUCTION: Отключаем все логи для производительности
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// Заглушка для отключения логов (раскомментируйте для отладки)
console.log = () => {};
console.warn = () => {};
console.info = () => {};
console.debug = () => {};
// Оставляем только console.error для критических ошибок

// =============================================================================
// Utilities
// =============================================================================

// Intersection Observer for animations
const observeElements = (selector, callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => observer.observe(element));
  
  return observer;
};

// Smooth scroll to element (with Lenis support)
const smoothScrollTo = (target, offset = 0) => {
  const element = document.querySelector(target);
  if (!element) return;
  
  // Use Lenis if available, otherwise fallback to native
  if (window.app && window.app.lenis) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.app.lenis.scrollTo(offsetPosition, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
  } else {
    // Fallback to native smooth scroll
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// =============================================================================
// Animation System
// =============================================================================

class AnimationManager {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupFadeInAnimations();
    this.setupSlideUpAnimations();
    this.setupScaleInAnimations();
  }
  
  setupFadeInAnimations() {
    observeElements('.llg-fade-in', (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });
  }
  
  setupSlideUpAnimations() {
    observeElements('.llg-slide-up', (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });
  }
  
  setupScaleInAnimations() {
    observeElements('.llg-scale-in', (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });
  }
}

// =============================================================================
// Navigation System
// =============================================================================

class NavigationManager {
  constructor() {
    this.nav = document.querySelector('.llg-nav');
    this.toggle = document.querySelector('.llg-nav__toggle');
    this.mobile = document.querySelector('.llg-nav__mobile');
    this.links = document.querySelectorAll('.llg-nav__link');
    
    this.init();
  }
  
  init() {
    this.setupMobileToggle();
    this.setupSmoothScroll();
    this.setupActiveLinks();
  }
  
  setupMobileToggle() {
    if (!this.toggle || !this.mobile) return;
    
    this.toggle.addEventListener('click', () => {
      this.mobile.classList.toggle('active');
      this.toggle.classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target) && this.mobile.classList.contains('active')) {
        this.mobile.classList.remove('active');
        this.toggle.classList.remove('active');
      }
    });
  }
  
  setupSmoothScroll() {
    this.links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          smoothScrollTo(href, 80); // Account for fixed nav height
          
          // Close mobile menu if open
          if (this.mobile.classList.contains('active')) {
            this.mobile.classList.remove('active');
            this.toggle.classList.remove('active');
          }
        });
      }
    });
  }
  
  setupActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    
    const updateActiveLink = () => {
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          this.links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    };
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Initial call
  }
}

// =============================================================================
// Form System
// =============================================================================

class FormManager {
  constructor() {
    this.forms = document.querySelectorAll('.llg-form');
    this.init();
  }
  
  init() {
    this.forms.forEach(form => this.setupForm(form));
  }
  
  setupForm(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });
    
    // Setup input validation
    const inputs = form.querySelectorAll('.llg-input, .llg-textarea');
    inputs.forEach(input => this.setupInputValidation(input));
  }
  
  setupInputValidation(input) {
    input.addEventListener('blur', () => {
      this.validateInput(input);
    });
    
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        this.validateInput(input);
      }
    });
  }
  
  validateInput(input) {
    const isValid = input.checkValidity();
    
    if (isValid) {
      input.classList.remove('error');
    } else {
      input.classList.add('error');
    }
    
    return isValid;
  }
  
  handleSubmit(form) {
    const inputs = form.querySelectorAll('.llg-input, .llg-textarea');
    let isFormValid = true;
    
    // Validate all inputs
    inputs.forEach(input => {
      if (!this.validateInput(input)) {
        isFormValid = false;
      }
    });
    
    if (isFormValid) {
      // Form is valid, handle submission
      console.log('Form submitted successfully');
      
      // Here you would typically send the form data to a server
      // For now, we'll just show a success message
      this.showSuccessMessage(form);
    }
  }
  
  showSuccessMessage(form) {
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    
    button.textContent = 'Message Sent!';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      form.reset();
    }, 3000);
  }
}

// =============================================================================
// Performance Monitor
// =============================================================================

class PerformanceMonitor {
  constructor() {
    this.init();
  }
  
  init() {
    // Monitor Core Web Vitals
    this.monitorLCP();
    this.monitorFID();
    this.monitorCLS();
  }
  
  monitorLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }
  
  monitorFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }
  
  monitorCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            // console.log('CLS:', clsValue);
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
}

// =============================================================================
// Main Application
// =============================================================================

class LLGApp {
  constructor() {
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }
  
    start() {
        // console.log('🚀 LLG Design System initialized');
        
        // Initialize header FIRST (before preloader)
        this.initHeader();
        
        // Initialize preloader FIRST
        this.initPreloader();
        
        // Initialize Lenis FIRST (before ScrollTrigger components)
        this.initLenis();
        
        // Initialize managers
        this.animationManager = new AnimationManager();
        this.navigationManager = new NavigationManager();
        this.formManager = new FormManager();
        
        // Initialize Cursor Play Button
        this.initCursorPlayButton();
        
        // Initialize Hero 3D Cube (after Lenis and CursorPlayButton)
        this.initHeroCube();
        
        // Initialize Services Slider (after Lenis and GSAP)
        this.initServicesSlider();
        
        // Initialize Future Marketing Cards (after Lenis and GSAP)
        this.initFutureMarketingCards();
        
        // Initialize Case Studies Horizontal Scroll (after Lenis and GSAP)
        this.initCaseStudiesHorizontalScroll();
        
        // Initialize Scroll to Top Button (after Lenis)
        this.initScrollToTop();
        
        // Initialize Section Navigation (after Lenis)
        this.initSectionNavigation();
        
        // Initialize Portfolio (after Lenis and GSAP)
        this.initPortfolio();
        
        // Initialize Word Animator (after GSAP and ScrollTrigger)
        this.initWordAnimator();
        
        // Initialize Footer (after GSAP and ScrollTrigger)
        this.initFooter();
        
        // Initialize Hero Stars Scroll Effect (after all other components)
        this.initHeroStarsScrollEffect();
        
        // Initialize performance monitoring (DISABLED for production)
        // Для включения в development раскомментируйте строку ниже:
        // this.performanceMonitor = new PerformanceMonitor();
        
        // Setup global event listeners
        this.setupGlobalEvents();
    }
  
  initLenis() {
    // Check if Lenis is available
    if (typeof Lenis === 'undefined') {
      console.warn('⚠️ Lenis not found, falling back to native scroll');
      return;
    }
    
    console.log('🎢 Initializing Lenis controlled smooth scroll');
    
    // Initialize Lenis with controlled scroll settings
    this.lenis = new Lenis({
      // 🎛️ Основная плавность (чем меньше - тем плавнее и контролируемее)
      lerp: 0.1,              // Очень плавно (вместо стандартных 0.1)
      
      // 🎮 Контроль скорости устройств ввода
      wheelMultiplier: 0.3,    // Замедлить колесо мыши в 3+ раза
      touchMultiplier: 0.5,    // Замедлить тач-скролл в 2 раза
      
      // 📱 Синхронизация тач-событий для лучшего контроля
      syncTouch: true,         // Включить синхронизацию тач-событий
      syncTouchLerp: 0.05,     // Плавность для тач-инерции
      touchInertiaMultiplier: 20, // Уменьшить силу инерции (стандарт: 35)
      
      // 🎯 Кастомная обработка событий скролла
      virtualScroll: (e) => {
        // Дополнительное замедление быстрого скролла
        const speed = Math.abs(e.deltaY);
        if (speed > 100) {
          e.deltaY *= 0.3; // Сильно замедлить быстрый скролл
        } else if (speed > 50) {
          e.deltaY *= 0.6; // Умеренно замедлить средний скролл
        }
        // Медленный скролл остается без изменений
      },
      
      // 📐 Стандартные настройки
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      autoRaf: false,          // Используем GSAP ticker
      overscroll: true,
      infinite: false,
      
      // 🚨 КРИТИЧЕСКИ ВАЖНО для section navigation!
      anchors: true,           // Включить поддержку навигации по секциям
    });
    
    // Integrate Lenis with GSAP ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);
    
    // 🚀 Адаптивная плавность в зависимости от скорости
    this.lenis.on('scroll', (e) => {
      const speed = Math.abs(e.velocity);
      
      // Увеличиваем плавность при быстром скролле
      if (speed > 2) {
        this.lenis.options.lerp = 0.03; // Еще плавнее при быстром скролле
      } else if (speed > 1) {
        this.lenis.options.lerp = 0.04; // Умеренная плавность
      } else {
        this.lenis.options.lerp = 0.05; // Базовая плавность
      }
    });
    
    // Handle ScrollTrigger refresh on Lenis scroll with speed limiting
    gsap.ticker.add((time) => {
      // 🛡️ Ограничиваем максимальную скорость Lenis
      if (Math.abs(this.lenis.velocity) > 3) {
        this.lenis.velocity *= 0.8; // Принудительно замедляем
      }
      
      this.lenis.raf(time * 1000); // Convert to milliseconds
    });
    
    // Performance configuration is now handled by PerformanceConfig
    // which is loaded before this script
    
    console.log('✅ Lenis controlled smooth scroll initialized');
    console.log('🎮 Scroll speed is now fully controlled and limited');
  }
  
  initCursorPlayButton() {
    // Check if CursorPlayButton class is available
    if (typeof CursorPlayButton === 'undefined') {
      console.warn('⚠️ CursorPlayButton component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.cursorPlayButton) {
      console.warn('⚠️ CursorPlayButton already initialized');
      return;
    }
    
    // Initialize with document.body as element (required by BaseComponent)
    this.cursorPlayButton = new CursorPlayButton(document.body, {
      debug: true
    });
    
    // Listen to cursor play button events (new architecture)
    this.cursorPlayButton.on('activated', (data) => {
      console.log('🎯 CursorPlayButton activated:', data);
    });
    
    this.cursorPlayButton.on('deactivated', (data) => {
      console.log('🎯 CursorPlayButton deactivated:', data);
    });
    
    this.cursorPlayButton.on('playTriggered', (data) => {
      console.log('▶️ CursorPlayButton play triggered:', data);
    });
    
    this.cursorPlayButton.on('mobileStateChanged', (data) => {
      console.log('📱 CursorPlayButton mobile state changed:', data);
    });
    
    // Make globally available
    window.cursorPlayButton = this.cursorPlayButton;
    
    console.log('✅ CursorPlayButton initialized with new architecture');
  }
  
  initPreloader() {
    // Check if Preloader is available
    if (typeof Preloader === 'undefined') {
      console.warn('⚠️ Preloader not found');
      return;
    }
    
    // Find DOM element for preloader
    const preloaderElement = document.getElementById('preloader');
    if (!preloaderElement) {
      console.warn('⚠️ Preloader element not found');
      return;
    }
    
    // Initialize with DOM element (required by BaseComponent)
    this.preloader = new Preloader(preloaderElement);
    
    // Listen to preloader events (new architecture)
    this.preloader.on('hidden', () => {
      console.log('🎉 Preloader completed and hidden');
      // Cancel any existing fallback timer
      if (window.fallbackTimer) {
        clearTimeout(window.fallbackTimer);
        window.fallbackTimer = null;
      }
    });
    
    this.preloader.on('forceHidden', () => {
      console.log('⚠️ Preloader was force hidden');
    });
    
    // Emergency fallback timer ONLY (much longer timeout)
    window.fallbackTimer = setTimeout(() => {
      if (this.preloader && document.getElementById('preloader')) {
        console.log('🚨 Emergency fallback: force hiding preloader after 10 seconds');
        this.preloader.forceHide();
      }
    }, 10000); // Увеличено до 10 секунд для emergency случаев
    
    // Make globally available
    window.preloader = this.preloader;
    
    console.log('✅ Preloader initialized with new architecture');
  }
  
  initHeroCube() {
    // Check if HeroCubeController is available
    if (typeof HeroCubeController === 'undefined') {
      console.warn('⚠️ HeroCubeController component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.heroCube) {
      console.warn('⚠️ HeroCube already initialized');
      return;
    }
    
    // Find DOM element for hero-cube (required by BaseComponent)
    const heroElement = document.querySelector('#hero');
    if (!heroElement) {
      console.warn('⚠️ Hero element not found');
      return;
    }
    
    // Initialize with DOM element (required by AnimatedInteractiveComponent)
    this.heroCube = new HeroCubeController(heroElement);
    
    // Listen to hero-cube events (new architecture)
    this.heroCube.on('cubeAnimationStart', (data) => {
      console.log('🎲 HeroCube animation started:', data);
    });
    
    this.heroCube.on('cubeAnimationComplete', (data) => {
      console.log('🎲 HeroCube animation completed:', data);
    });
    
    this.heroCube.on('scaleEffectStart', (data) => {
      console.log('📏 HeroCube scale effect started:', data);
    });
    
    this.heroCube.on('scaleEffectComplete', (data) => {
      console.log('📏 HeroCube scale effect completed:', data);
    });
    
    this.heroCube.on('videoShown', () => {
      console.log('🎬 HeroCube video shown');
    });
    
    this.heroCube.on('videoHidden', () => {
      console.log('🎬 HeroCube video hidden');
    });
    
    // Make globally available for other components
    window.heroCubeAPI = this.heroCube;
    window.app.heroCube = this.heroCube;
    
    console.log('✅ HeroCube initialized with new microservices architecture');
  }
  
  initServicesSlider() {
    // Check if Services class is available
    if (typeof Services === 'undefined') {
      console.warn('⚠️ Services component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.services) {
      console.warn('⚠️ Services already initialized');
      return;
    }
    
    // Find DOM element for services (required by BaseComponent)
    const servicesElement = document.querySelector('.llg-services-section');
    if (!servicesElement) {
      console.warn('⚠️ Services element not found');
      return;
    }
    
    // Initialize with DOM element (required by AnimatedInteractiveComponent)
    this.services = new Services(servicesElement, {
      debug: true,
      modalEnabled: true,
      modalLenisEnabled: true
    });
    
    // Listen to services events (new architecture)
    this.services.on('cardClicked', (data) => {
      console.log('🎴 Services card clicked:', data);
    });
    
    this.services.on('modalShown', (data) => {
      console.log('📱 Services modal shown:', data);
    });
    
    this.services.on('modalHidden', () => {
      console.log('📱 Services modal hidden');
    });
    
    this.services.on('scrollEntered', () => {
      console.log('📜 Services scroll section entered');
    });
    
    this.services.on('scrollUpdated', (data) => {
      // console.log('📜 Services scroll updated:', data.progress);
    });
    
    this.services.on('resized', () => {
      console.log('📏 Services component resized');
    });
    
    // Make globally available
    window.servicesAPI = this.services;
    
    console.log('✅ Services initialized with new architecture');
  }
  
  initCaseStudiesHorizontalScroll() {
    // Check if CaseStudiesHorizontalScroll class is available
    if (typeof CaseStudiesHorizontalScroll === 'undefined') {
      console.warn('⚠️ CaseStudiesHorizontalScroll component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.caseStudies) {
      console.warn('⚠️ CaseStudiesHorizontalScroll already initialized');
      return;
    }
    
    // Find DOM element for case-studies (required by BaseComponent)
    const caseStudiesElement = document.querySelector('#case-studies');
    if (!caseStudiesElement) {
      console.warn('⚠️ Case Studies element not found');
      return;
    }
    
    // Initialize with DOM element (required by AnimatedInteractiveComponent)
    this.caseStudies = new CaseStudiesHorizontalScroll(caseStudiesElement);
    
    // Listen to case-studies events (new architecture)
    this.caseStudies.on('slideChanged', (data) => {
      console.log('🎢 Case Studies slide changed:', data);
    });
    
    this.caseStudies.on('slideAnimationStart', (data) => {
      console.log('🎬 Case Studies slide animation started:', data);
    });
    
    this.caseStudies.on('slideAnimationComplete', (data) => {
      console.log('✨ Case Studies slide animation completed:', data);
    });
    
    this.caseStudies.on('resized', (data) => {
      console.log('📏 Case Studies resized:', data);
    });
    
    // Make globally available
    window.caseStudiesAPI = this.caseStudies;
    
    console.log('✅ CaseStudiesHorizontalScroll initialized with new architecture');
  }
  
  initScrollToTop() {
    // Check if ScrollToTop class is available
    if (typeof ScrollToTop === 'undefined') {
      console.warn('⚠️ ScrollToTop component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.scrollToTop) {
      console.warn('⚠️ ScrollToTop already initialized');
      return;
    }
    
    // Find DOM element for scroll-to-top (required by BaseComponent)
    const scrollToTopElement = document.getElementById('scroll-to-top');
    if (!scrollToTopElement) {
      console.warn('⚠️ Scroll to top element not found');
      return;
    }
    
    // Initialize with DOM element (required by InteractiveComponent)
    this.scrollToTop = new ScrollToTop(scrollToTopElement);
    
    // Listen to scroll-to-top events (new architecture)
    this.scrollToTop.on('buttonShown', () => {
      console.log('👆 Scroll to top button shown');
    });
    
    this.scrollToTop.on('buttonHidden', () => {
      console.log('👇 Scroll to top button hidden');
    });
    
    this.scrollToTop.on('scrollToTopClicked', () => {
      console.log('🚀 Scroll to top clicked');
    });
    
    this.scrollToTop.on('scrollStarted', (data) => {
      console.log('📍 Scroll to top started:', data);
    });
    
    // Make globally available
    window.scrollToTopAPI = this.scrollToTop;
    
    console.log('✅ ScrollToTop initialized with new architecture');
  }
  
  initSectionNavigation() {
    // Check if SectionNavigation class is available
    if (typeof SectionNavigation === 'undefined') {
      console.warn('⚠️ SectionNavigation component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.sectionNavigation) {
      console.warn('⚠️ SectionNavigation already initialized');
      return;
    }
    
    // Find DOM element for section-navigation (required by BaseComponent)
    const sectionNavigationElement = document.getElementById('section-navigation');
    if (!sectionNavigationElement) {
      console.warn('⚠️ Section navigation element not found');
      return;
    }
    
    // Initialize with DOM element (required by InteractiveComponent)
    this.sectionNavigation = new SectionNavigation(sectionNavigationElement);
    
    // Listen to section navigation events (new architecture)
    this.sectionNavigation.on('sectionChanged', (data) => {
      console.log('🧭 Section changed:', data);
    });
    
    this.sectionNavigation.on('navigationToggled', (data) => {
      console.log('📱 Navigation toggled:', data);
    });
    
    // Make globally available
    window.sectionNavigationAPI = this.sectionNavigation;
    
    console.log('✅ SectionNavigation initialized with new architecture');
  }
  
  initPortfolio() {
    // Check if Portfolio class is available
    if (typeof Portfolio === 'undefined') {
      console.warn('⚠️ Portfolio component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.portfolio) {
      console.warn('⚠️ Portfolio already initialized');
      return;
    }
    
    // Find DOM element for portfolio (required by BaseComponent)
    const portfolioElement = document.querySelector('#portfolio');
    if (!portfolioElement) {
      console.warn('⚠️ Portfolio element not found');
      return;
    }
    
    // Initialize with DOM element (required by AnimatedInteractiveComponent)
    this.portfolio = new Portfolio(portfolioElement, {
      debug: true,
      mouseTrackingEnabled: true,
      hoverAnimationEnabled: true
    });
    
    // Listen to portfolio events (new architecture)
    this.portfolio.on('itemClicked', (data) => {
      console.log('🎨 Portfolio item clicked:', data);
    });
    
    this.portfolio.on('gridAnimated', (data) => {
      console.log('🎬 Portfolio grid animated:', data);
    });
    
    this.portfolio.on('portfolioResized', (data) => {
      console.log('📏 Portfolio resized:', data);
    });
    
    // Make globally available
    window.portfolioAPI = this.portfolio;
    
    console.log('✅ Portfolio initialized with new architecture');
  }
  
  initWordAnimator() {
    // Check if WordAnimator class is available
    if (typeof WordAnimator === 'undefined') {
      console.warn('⚠️ WordAnimator component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.wordAnimator) {
      console.warn('⚠️ WordAnimator already initialized');
      return;
    }
    
    // Find DOM element for word-animator (required by BaseComponent)
    const wordAnimatorElement = document.querySelector('.word-animator');
    if (!wordAnimatorElement) {
      console.warn('⚠️ WordAnimator element not found, using document.body');
      // WordAnimator can work with document.body as it searches for elements globally
    }
    
    // Initialize with DOM element (required by AnimatedComponent)
    this.wordAnimator = new WordAnimator(wordAnimatorElement || document.body);
    
    // Listen to word-animator events (new architecture)
    this.wordAnimator.on('wordsAnimatedIn', (data) => {
      console.log('🔄 WordAnimator words animated in:', data);
    });
    
    this.wordAnimator.on('wordsAnimatedOut', (data) => {
      console.log('🔄 WordAnimator words animated out:', data);
    });
    
    this.wordAnimator.on('scrollBlurStarted', (data) => {
      console.log('🌫️ WordAnimator scroll blur started:', data);
    });
    
    this.wordAnimator.on('scrollBlurCompleted', (data) => {
      console.log('🌫️ WordAnimator scroll blur completed:', data);
    });
    
    this.wordAnimator.on('elementAdded', (data) => {
      console.log('➕ WordAnimator element added:', data);
    });
    
    // Make globally available
    window.wordAnimatorAPI = this.wordAnimator;
    
    console.log('✅ WordAnimator initialized with new architecture');
  }
  
  initHeader() {
    // Check if Header class is available
    if (typeof Header === 'undefined') {
      console.warn('⚠️ Header component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.header) {
      console.warn('⚠️ Header already initialized');
      return;
    }
    
    // Find DOM element for header (required by BaseComponent)
    const headerElement = document.querySelector('.header');
    if (!headerElement) {
      console.warn('⚠️ Header element not found');
      return;
    }
    
    // Initialize with DOM element (required by AnimatedInteractiveComponent)
    this.header = new Header(headerElement);
    
    // Listen to header events (new architecture)
    this.header.on('scrollStateChanged', (data) => {
      console.log('🔄 Header scroll state changed:', data);
    });
    
    this.header.on('offcanvasOpened', () => {
      console.log('📱 Header offcanvas opened');
    });
    
    this.header.on('offcanvasClosed', () => {
      console.log('📱 Header offcanvas closed');
    });
    
    // Make globally available
    window.headerAPI = this.header;
    
    console.log('✅ Header initialized with new architecture');
  }
  
  initFooter() {
    // Check if Footer class is available
    if (typeof Footer === 'undefined') {
      console.warn('⚠️ Footer component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.footer) {
      console.warn('⚠️ Footer already initialized');
      return;
    }
    
    // Find DOM element for footer (required by BaseComponent)
    const footerElement = document.querySelector('.footer');
    if (!footerElement) {
      console.warn('⚠️ Footer element not found');
      return;
    }
    
    // Initialize with DOM element (required by AnimatedInteractiveComponent)
    this.footer = new Footer(footerElement);
    
    // Listen to footer events (new architecture)
    this.footer.on('widgetAnimationStart', (data) => {
      console.log('🎬 Footer widget animation started:', data);
    });
    
    this.footer.on('widgetAnimationComplete', (data) => {
      console.log('✨ Footer widget animation completed:', data);
    });
    
    this.footer.on('copyrightAnimationStart', () => {
      console.log('©️ Footer copyright animation started');
    });
    
    this.footer.on('copyrightAnimationComplete', () => {
      console.log('©️ Footer copyright animation completed');
    });
    
    this.footer.on('copyrightRotationStart', () => {
      console.log('🔄 Footer copyright rotation started');
    });
    
    this.footer.on('reducedMotionChanged', (data) => {
      console.log('♿ Footer reduced motion preference changed:', data);
    });
    
    // Make globally available
    window.footerAPI = this.footer;
    
    console.log('✅ Footer initialized with new architecture');
  }
  
  initFutureMarketingCards() {
    // Check if FutureMarketing class is available
    if (typeof FutureMarketing === 'undefined') {
      console.warn('⚠️ FutureMarketing component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.futureMarketing) {
      console.warn('⚠️ FutureMarketing already initialized');
      return;
    }
    
    // Find DOM element for future-marketing (required by BaseComponent)
    const futureMarketingElement = document.querySelector('#future-marketing');
    if (!futureMarketingElement) {
      console.warn('⚠️ Future Marketing element not found');
      return;
    }
    
    // Initialize with DOM element (required by AnimatedInteractiveComponent)
    this.futureMarketing = new FutureMarketing(futureMarketingElement, {
      debug: true,
      totalCards: 7
    });
    
    // Listen to future-marketing events (new architecture)
    this.futureMarketing.on('cardChanged', (data) => {
      console.log('🎴 Future Marketing card changed:', data);
    });
    
    this.futureMarketing.on('progressUpdated', (data) => {
      // console.log('📊 Future Marketing progress updated:', data.progress);
    });
    
    this.futureMarketing.on('scrollEntered', () => {
      console.log('📜 Future Marketing scroll entered');
    });
    
    this.futureMarketing.on('scrollLeft', () => {
      console.log('📜 Future Marketing scroll left');
    });
    
    this.futureMarketing.on('resized', (data) => {
      console.log('📏 Future Marketing resized:', data);
    });
    
    // Make globally available
    window.futureMarketingAPI = this.futureMarketing;
    
    console.log('✅ FutureMarketing initialized with new architecture');
  }
  
  initHeroStarsScrollEffect() {
    // Check if HeroStarsScroll class is available
    if (typeof HeroStarsScroll === 'undefined') {
      console.warn('⚠️ HeroStarsScroll component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.heroStarsScrollEffect) {
      console.warn('⚠️ HeroStarsScroll already initialized');
      return;
    }
    
    // Find DOM element for hero-stars-scroll (required by BaseComponent)
    const heroElement = document.querySelector('#hero');
    if (!heroElement) {
      console.warn('⚠️ Hero element not found for HeroStarsScroll');
      return;
    }
    
    // Check if hero stars animation exists
    const heroStarsElement = document.querySelector('.hero-stars-animation');
    if (!heroStarsElement) {
      console.warn('⚠️ Hero stars animation element not found');
      return;
    }
    
    // Initialize with DOM element (required by BaseComponent)
    this.heroStarsScrollEffect = new HeroStarsScroll(heroElement, {
      debug: true,
      enableDebug: true
    });
    
    // Listen to hero-stars-scroll events (new architecture)
    this.heroStarsScrollEffect.on('colorsUpdated', (data) => {
      console.log('🌟 HeroStarsScroll colors updated:', data);
    });
    
    this.heroStarsScrollEffect.on('scroll', (data) => {
      // console.log('🌟 HeroStarsScroll scroll:', data.progress);
    });
    
    this.heroStarsScrollEffect.on('scrollEnd', (data) => {
      console.log('🌟 HeroStarsScroll scroll ended:', data);
    });
    
    this.heroStarsScrollEffect.on('debugEnabled', () => {
      console.log('🐛 HeroStarsScroll debug mode enabled');
    });
    
    // Make globally available
    window.heroStarsScrollAPI = this.heroStarsScrollEffect;
    
    console.log('✅ HeroStarsScroll initialized with new BaseComponent architecture');
  }
  
  
  setupGlobalEvents() {
    // Handle reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.handleReducedMotion(mediaQuery);
    mediaQuery.addEventListener('change', this.handleReducedMotion);
    
    // Handle resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }
  
  handleReducedMotion(mediaQuery) {
    if (mediaQuery.matches) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }
  
  handleResize() {
    // Handle any resize-specific logic
    console.log('Window resized');
  }
}

// =============================================================================
// Initialize Application
// =============================================================================

const app = new LLGApp();

// Make app globally available for Lenis integration
window.app = app;

// =============================================================================
// Developer Tools - Console Commands
// =============================================================================

// 🛠️ Команды для разработчиков в консоли
window.dev = {
  // Включить мониторинг производительности
  enablePerformanceMonitoring() {
    // Сначала включаем логи, чтобы видеть сообщения
    this.enableLogs();
    
    if (!window.app.performanceMonitor) {
      console.log('🚀 Включаем мониторинг производительности...');
      window.app.performanceMonitor = new PerformanceMonitor();
      console.log('✅ PerformanceMonitor включен');
      console.log('📊 Мониторинг Core Web Vitals активен');
      console.log('');
      console.log('🔍 Теперь вы увидите в консоли:');
      console.log('   - LCP: время загрузки основного контента');
      console.log('   - FID: время отклика на первое взаимодействие');
      console.log('   - CLS: стабильность макета');
      console.log('');
      console.log('💡 Попробуйте прокрутить страницу или кликнуть что-то');
    } else {
      console.log('⚠️ PerformanceMonitor уже включен');
    }
  },
  
  // Отключить мониторинг производительности
  disablePerformanceMonitoring() {
    if (window.app.performanceMonitor) {
      console.log('🛑 Отключаем мониторинг производительности...');
      // Здесь можно добавить cleanup если нужно
      window.app.performanceMonitor = null;
      console.log('✅ PerformanceMonitor отключен');
    } else {
      console.log('⚠️ PerformanceMonitor уже отключен');
    }
  },
  
  // Включить расширенный мониторинг GSAP
  enableGSAPMonitoring() {
    if (window.PerformanceConfig) {
      console.log('🚀 Включаем расширенный GSAP мониторинг...');
      window.PerformanceConfig.enableMonitoring = true;
      
      // Включаем FPS мониторинг
      if (typeof window.PerformanceConfig.setupFPSLimit === 'function') {
        window.PerformanceConfig.setupFPSLimit();
      }
      
      // Включаем мониторинг производительности
      if (typeof window.PerformanceConfig.setupPerformanceMonitoring === 'function') {
        window.PerformanceConfig.setupPerformanceMonitoring();
      }
      
      console.log('✅ GSAP мониторинг включен');
      console.log('📊 FPS и Memory мониторинг активен');
    } else {
      console.log('❌ PerformanceConfig не найден');
    }
  },
  
  // Отключить расширенный мониторинг GSAP
  disableGSAPMonitoring() {
    if (window.PerformanceConfig) {
      console.log('🛑 Отключаем расширенный GSAP мониторинг...');
      window.PerformanceConfig.enableMonitoring = false;
      
      // Очищаем интервалы если есть
      if (window.PerformanceConfig.fpsMonitorInterval) {
        clearInterval(window.PerformanceConfig.fpsMonitorInterval);
      }
      if (window.PerformanceConfig.memoryMonitorInterval) {
        clearInterval(window.PerformanceConfig.memoryMonitorInterval);
      }
      
      console.log('✅ GSAP мониторинг отключен');
    } else {
      console.log('❌ PerformanceConfig не найден');
    }
  },
  
  // Включить все логи
  enableLogs() {
    console.log('🚀 Включаем все логи...');
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    console.log('✅ Все логи включены');
  },
  
  // Отключить все логи
  disableLogs() {
    console.log('🛑 Отключаем все логи...');
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
    // console.error остается активным
  },
  
  // Показать текущие метрики производительности
  showMetrics() {
    console.log('📊 Текущие метрики производительности:');
    console.log('');
    
    // Показать GSAP метрики если доступны
    if (window.PerformanceConfig && typeof window.PerformanceConfig.getMetrics === 'function') {
      const metrics = window.PerformanceConfig.getMetrics();
      console.log('🎮 GSAP Metrics:');
      console.log(`   Average FPS: ${metrics.averageFPS ? metrics.averageFPS.toFixed(1) : 'N/A'}`);
      console.log(`   Min FPS: ${metrics.minFPS ? metrics.minFPS.toFixed(1) : 'N/A'}`);
      console.log(`   Max FPS: ${metrics.maxFPS ? metrics.maxFPS.toFixed(1) : 'N/A'}`);
      console.log(`   Samples: ${metrics.samplesCount || 0}`);
      console.log('');
    }
    
    // Показать память
    if (performance.memory) {
      const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
      const limit = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
      const usagePercent = ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1);
      
      console.log('💾 Memory Usage:');
      console.log(`   Used: ${used} MB (${usagePercent}%)`);
      console.log(`   Total: ${total} MB`);
      console.log(`   Limit: ${limit} MB`);
      console.log('');
    }
    
    // Показать текущий FPS
    console.log('🎯 Measuring current FPS...');
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        console.log(`📈 Current FPS: ${frameCount}`);
        
        // Оценка производительности
        if (frameCount >= 55) {
          console.log('🟢 Отличная производительность!');
        } else if (frameCount >= 30) {
          console.log('🟡 Хорошая производительность');
        } else {
          console.log('🔴 Низкая производительность - возможны проблемы');
        }
        return;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  },
  
  // Показать живые метрики (обновляются каждые 2 секунды)
  showLiveMetrics() {
    // Включаем логи для live мониторинга
    const wasLogsEnabled = console.log === originalConsole.log;
    if (!wasLogsEnabled) {
      console.log = originalConsole.log;
    }
    
    console.log('🔴 LIVE: Запуск мониторинга в реальном времени...');
    console.log('💡 Для остановки введите: dev.stopLiveMetrics()');
    console.log('');
    
    let updateCount = 0;
    
    this.liveMetricsInterval = setInterval(() => {
      updateCount++;
      console.clear();
      console.log(`🔴 LIVE METRICS (обновление #${updateCount})`);
      console.log('═'.repeat(50));
      
      // FPS в реальном времени
      let frameCount = 0;
      let startTime = performance.now();
      
      const measureLiveFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - startTime >= 1000) {
          console.log(`📈 FPS: ${frameCount} ${frameCount >= 55 ? '🟢' : frameCount >= 30 ? '🟡' : '🔴'}`);
          
          // Memory
          if (performance.memory) {
            const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
            const usagePercent = ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1);
            console.log(`💾 Memory: ${used} MB (${usagePercent}%)`);
          }
          
          // GSAP метрики
          if (window.PerformanceConfig && window.PerformanceConfig.enableMonitoring) {
            console.log('🎮 GSAP мониторинг: АКТИВЕН');
          } else {
            console.log('🎮 GSAP мониторинг: отключен');
          }
          
          // Performance Monitor
          if (window.app.performanceMonitor) {
            console.log('📊 Core Web Vitals: АКТИВЕН');
          } else {
            console.log('📊 Core Web Vitals: отключен');
          }
          
          console.log('');
          console.log('💡 dev.stopLiveMetrics() - остановить мониторинг');
          return;
        }
        
        requestAnimationFrame(measureLiveFPS);
      };
      
      requestAnimationFrame(measureLiveFPS);
      
    }, 7000);
  },
  
  // Остановить живые метрики
  stopLiveMetrics() {
    // Включаем логи для показа сообщения
    const wasLogsEnabled = console.log === originalConsole.log;
    if (!wasLogsEnabled) {
      console.log = originalConsole.log;
    }
    
    if (this.liveMetricsInterval) {
      clearInterval(this.liveMetricsInterval);
      this.liveMetricsInterval = null;
      console.log('🛑 Мониторинг в реальном времени остановлен');
    } else {
      console.log('⚠️ Мониторинг в реальном времени не запущен');
    }
    
    // Возвращаем логи в исходное состояние если они были отключены
    if (!wasLogsEnabled) {
      console.log = () => {};
    }
  },
  
  // Показать справку по командам
  help() {
    // Правильная проверка состояния логов
    const wasLogsEnabled = console.log === originalConsole.log;
    
    // Временно включаем логи для показа справки
    if (!wasLogsEnabled) {
      console.log = originalConsole.log;
    }
    
    console.log(`
🛠️ Developer Tools - Доступные команды:

📊 Мониторинг производительности:
  dev.enablePerformanceMonitoring()  - Включить Core Web Vitals мониторинг
  dev.disablePerformanceMonitoring() - Отключить Core Web Vitals мониторинг
  dev.enableGSAPMonitoring()         - Включить GSAP FPS/Memory мониторинг
  dev.disableGSAPMonitoring()        - Отключить GSAP мониторинг
  dev.showMetrics()                  - Показать текущие метрики
  dev.showLiveMetrics()              - 🔴 LIVE мониторинг в реальном времени
  dev.stopLiveMetrics()              - Остановить live мониторинг

📝 Логирование:
  dev.enableLogs()                   - Включить все логи
  dev.disableLogs()                  - Отключить все логи

ℹ️ Справка:
  dev.help()                         - Показать эту справку

🚀 Быстрый старт:
  dev.enablePerformanceMonitoring()  - Включает логи + Core Web Vitals
  dev.showLiveMetrics()              - Живые метрики каждые 7 секунд
  dev.showMetrics()                  - Разовый замер производительности

💡 Логи сейчас: ${wasLogsEnabled ? 'ВКЛЮЧЕНЫ' : 'отключены'}
    `);
    
    // Возвращаем логи в исходное состояние если они были отключены
    if (!wasLogsEnabled) {
      console.log = () => {};
    }
  }
};

// Показать справку при загрузке (только если консоль открыта)
console.log('🛠️ Developer Tools доступны! Введите dev.help() для справки');

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LLGApp, AnimationManager, NavigationManager, FormManager };
}
