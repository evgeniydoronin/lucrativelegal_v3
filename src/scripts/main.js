// =============================================================================
// LLG Design System - Main JavaScript
// =============================================================================

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
            console.log('CLS:', clsValue);
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
        console.log('🚀 LLG Design System initialized');
        
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
        
        // Initialize Case Studies Horizontal Scroll (after Lenis and GSAP)
        this.initCaseStudiesHorizontalScroll();
        
        // Initialize Scroll to Top Button (after Lenis)
        this.initScrollToTop();
        
        // Initialize performance monitoring
        this.performanceMonitor = new PerformanceMonitor();
        
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
      lerp: 0.05,              // Очень плавно (вместо стандартных 0.1)
      
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
    
    // Disable lag smoothing for better performance
    gsap.ticker.lagSmoothing(0);
    
    console.log('✅ Lenis controlled smooth scroll initialized');
    console.log('🎮 Scroll speed is now fully controlled and limited');
  }
  
  initCursorPlayButton() {
    // Check if CursorPlayButton is available
    if (typeof CursorPlayButton === 'undefined') {
      console.warn('⚠️ CursorPlayButton not found');
      return;
    }
    
    this.cursorPlayButton = new CursorPlayButton();
    
    // Make globally available
    window.cursorPlayButton = this.cursorPlayButton;
    
    console.log('✅ CursorPlayButton initialized');
  }
  
  initPreloader() {
    // Check if Preloader is available
    if (typeof Preloader === 'undefined') {
      console.warn('⚠️ Preloader not found');
      return;
    }
    
    this.preloader = new Preloader();
    
    // Add fallback timer for safety
    window.fallbackTimer = setTimeout(() => {
      if (this.preloader && document.getElementById('preloader')) {
        console.log('⏰ Fallback: force hiding preloader after 5 seconds');
        this.preloader.forceHide();
      }
    }, 5000);
    
    // Make globally available
    window.preloader = this.preloader;
    
    console.log('✅ Preloader initialized');
  }
  
  initHeroCube() {
    const heroElement = document.querySelector('#hero');
    if (heroElement) {
      this.heroCube = new HeroCube(heroElement);
      
      // Делаем экземпляр доступным для scroll-to-top кнопки
      if (this.heroCube) {
        console.log('✅ Hero cube экземпляр сохранен в window.app.heroCube');
      }
    }
  }
  
  initServicesSlider() {
    // Check if initServicesSlider function is available
    if (typeof window.initServicesSlider === 'undefined') {
      console.warn('⚠️ Services Slider not found');
      return;
    }
    
    // Initialize services slider
    window.initServicesSlider();
    
    console.log('✅ Services Slider initialized');
  }
  
  initCaseStudiesHorizontalScroll() {
    // Check if initCaseStudiesHorizontalScroll function is available
    if (typeof window.initCaseStudiesHorizontalScroll === 'undefined') {
      console.warn('⚠️ Case Studies Horizontal Scroll not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.caseStudiesScroll) {
      console.warn('⚠️ Case Studies Horizontal Scroll already initialized');
      return;
    }
    
    // Check if container exists
    const container = document.querySelector('.horizontal-scroll-container');
    if (!container) {
      console.warn('⚠️ Case Studies container not found');
      return;
    }
    
    // Initialize case studies horizontal scroll
    this.caseStudiesScroll = window.initCaseStudiesHorizontalScroll();
    
    console.log('✅ Case Studies Horizontal Scroll initialized');
  }
  
  initScrollToTop() {
    // Check if initScrollToTop function is available
    if (typeof window.initScrollToTop === 'undefined') {
      console.warn('⚠️ Scroll to Top component not found');
      return;
    }
    
    // Check if already initialized to prevent duplicates
    if (this.scrollToTop) {
      console.warn('⚠️ Scroll to Top already initialized');
      return;
    }
    
    // Check if button exists
    const button = document.getElementById('scroll-to-top');
    if (!button) {
      console.warn('⚠️ Scroll to Top button not found');
      return;
    }
    
    // Initialize scroll to top button
    this.scrollToTop = window.initScrollToTop();
    
    console.log('✅ Scroll to Top button initialized');
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

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LLGApp, AnimationManager, NavigationManager, FormManager };
}
