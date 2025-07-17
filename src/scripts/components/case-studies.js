// =============================================================================
// Case Studies - Horizontal Scroll Component
// =============================================================================

/*
🎯 КЛЮЧЕВЫЕ ПРИНЦИПЫ НАСТРОЙКИ ГОРИЗОНТАЛЬНОГО СКРОЛЛА:

1. 🔗 TRIGGER И PIN ДОЛЖНЫ БЫТЬ ОДИНАКОВЫМИ!
   ❌ Неправильно: trigger: section, pin: container
   ✅ Правильно:   trigger: container, pin: container
   
2. 📏 РАСЧЕТ ДИСТАНЦИИ СКРОЛЛА:
   scrollDistance = (количество_слайдов - 1) * window.innerWidth
   Пример: 7 слайдов = 6 * 1920px = 11520px
   
3. 🔄 REFRESHPRIORITY для избежания конфликтов:
   Компонент с большим числом обрабатывается первым
   case-studies: refreshPriority: 1
   services: refreshPriority: 0 (default)
   
4. 📌 SNAP НАСТРОЙКИ:
   snapTo: 1 / (slides.length - 1) - для равномерного snap к слайдам
   
5. 🚀 ИНТЕГРАЦИЯ С LENIS:
   Всегда проверять window.app.lenis перед использованием
   Fallback на нативный window.scrollTo()
   
6. 🎬 TIMELINE АНИМАЦИЯ:
   x: -scrollDistance (отрицательное = движение влево)
   ease: 'none' (линейное движение)
   
⚠️ ЧАСТЫЕ ОШИБКИ:
- Разные trigger и pin элементы
- Забыть refreshPriority при наличии других ScrollTrigger
- Неправильный расчет scrollDistance
- Не учесть интеграцию с Lenis
*/

class CaseStudiesHorizontalScroll {
  constructor() {
    // 🔍 ВАЖНО: Получаем все необходимые элементы
    this.section = document.querySelector('#case-studies');                    // Вся секция (для справки)
    this.container = document.querySelector('.horizontal-scroll-container');   // Контейнер который будем пинить
    this.slidesWrapper = document.querySelector('.slides-wrapper');            // Обертка слайдов (двигается по X)
    this.slides = document.querySelectorAll('.slide');                         // Все слайды
    
    if (!this.section || !this.container || !this.slidesWrapper || !this.slides.length) {
      console.warn('⚠️ Case Studies elements not found');
      return;
    }
    
    this.init();
  }
  
  init() {
    // console.log('🎢 Initializing Case Studies Horizontal Scroll');
    
    // Wait for GSAP and ScrollTrigger to be available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('⚠️ GSAP or ScrollTrigger not found');
      return;
    }
    
    this.setupHorizontalScroll();
    this.setupSlideIndicators();
    
    console.log('✅ Case Studies Horizontal Scroll initialized');
  }
  
  setupHorizontalScroll() {
    // 📏 РАСЧЕТ ДИСТАНЦИИ СКРОЛЛА
    // Для 7 слайдов нужно проскролить 6 viewport widths (7-1=6)
    // Например: 7 слайдов = 6 * 1920px = 11520px горизонтального движения
    const scrollDistance = (this.slides.length - 1) * window.innerWidth;
    
    // 🎬 СОЗДАНИЕ TIMELINE С SCROLLTRIGGER
    this.timeline = gsap.timeline({
      scrollTrigger: {
        // 🎯 КРИТИЧЕСКИ ВАЖНО: trigger и pin должны быть ОДИНАКОВЫМИ!
        // Если trigger = section, а pin = container - будут проблемы с pin-spacer
        trigger: this.container,        // Элемент который запускает анимацию
        pin: this.container,            // Элемент который фиксируется (должен быть тот же!)
        
        // 🔄 ПРИОРИТЕТ ОБНОВЛЕНИЯ: обрабатывать ДО services section
        // Это предотвращает конфликт между ScrollTrigger компонентами
        refreshPriority: 1,             // Чем больше число - тем раньше обрабатывается
        
        // 🎮 НАСТРОЙКИ СКРОЛЛА
        scrub: 1,                       // Плавная связь со скроллом (1 сек на "догон")
        start: 'top top',               // Начать когда верх контейнера = верх viewport
        end: () => `+=${scrollDistance}`, // Закончить через scrollDistance пикселей
        
        // 📌 SNAP К СЛАЙДАМ: автоматически "прилипать" к каждому слайду
        snap: {
          snapTo: 1 / (this.slides.length - 1),  // Для 7 слайдов = 1/6 = 0.167 (каждые 16.7%)
          duration: { min: 0.2, max: 0.6 },      // Время snap анимации
          delay: 0.1,                             // Задержка после остановки скролла
          ease: 'power2.inOut'                    // Плавность snap анимации
        },
        
        // 📊 ОБНОВЛЕНИЕ ИНДИКАТОРОВ при скролле
        onUpdate: (self) => {
          this.updateSlideIndicators(self.progress);
        },
        
        // 🔄 ПЕРЕСЧЕТ при изменении размера окна
        invalidateOnRefresh: true,      // Пересчитать анимацию при refresh
        anticipatePin: 1                // Предвосхищение пина для плавности
      }
    });
    
    // 🏃‍♂️ ГОРИЗОНТАЛЬНОЕ ДВИЖЕНИЕ СЛАЙДОВ
    // Двигаем slides-wrapper влево на всю дистанцию
    this.timeline.to(this.slidesWrapper, {
      x: -scrollDistance,             // Отрицательное значение = движение влево
      ease: 'none'                    // Линейное движение (без easing)
    });
    
    // Add individual slide animations
    this.slides.forEach((slide, index) => {
      const slideContent = slide.querySelector('.slide-content');
      
      // Fade in slide content as it comes into view
      gsap.set(slideContent, { opacity: 0, y: 50 });
      
      ScrollTrigger.create({
        trigger: slide,
        containerAnimation: this.timeline,
        start: 'left 80%',
        end: 'right 20%',
        onEnter: () => {
          gsap.to(slideContent, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          });
        },
        onLeave: () => {
          gsap.to(slideContent, {
            opacity: 0.7,
            duration: 0.3
          });
        },
        onEnterBack: () => {
          gsap.to(slideContent, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          });
        },
        onLeaveBack: () => {
          gsap.to(slideContent, {
            opacity: 0.7,
            duration: 0.3
          });
        }
      });
    });
  }
  
  setupSlideIndicators() {
    // Check if indicators already exist to prevent duplicates
    const existingIndicators = this.container.querySelector('.slide-indicators');
    if (existingIndicators) {
      existingIndicators.remove();
    }
    
    // Create slide indicators container
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'slide-indicators';
    
    // Create individual indicators
    this.indicators = [];
    this.slides.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = 'slide-indicator';
      if (index === 0) indicator.classList.add('active');
      
      // Add click functionality
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
      
      this.indicators.push(indicator);
      indicatorsContainer.appendChild(indicator);
    });
    
    // Add indicators to container
    this.container.appendChild(indicatorsContainer);
    
    // Style indicators with CSS-in-JS for immediate functionality
    this.styleIndicators(indicatorsContainer);
  }
  
  styleIndicators(container) {
    // Container styles
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.5rem',
      zIndex: '100',
      pointerEvents: 'auto'
    });
    
    // Individual indicator styles
    this.indicators.forEach(indicator => {
      Object.assign(indicator.style, {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '2px solid rgba(255, 255, 255, 0.6)'
      });
      
      // Hover effect
      indicator.addEventListener('mouseenter', () => {
        if (!indicator.classList.contains('active')) {
          indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        }
      });
      
      indicator.addEventListener('mouseleave', () => {
        if (!indicator.classList.contains('active')) {
          indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        }
      });
    });
  }
  
  updateSlideIndicators(progress) {
    // Safety check: ensure indicators are initialized before updating
    if (!this.indicators || !this.indicators.length) {
      return;
    }
    
    const currentSlideIndex = Math.round(progress * (this.slides.length - 1));
    
    this.indicators.forEach((indicator, index) => {
      if (index === currentSlideIndex) {
        indicator.classList.add('active');
        indicator.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        indicator.style.transform = 'scale(1.2)';
      } else {
        indicator.classList.remove('active');
        indicator.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        indicator.style.transform = 'scale(1)';
      }
    });
  }
  
  goToSlide(index) {
    // 🎯 ПЕРЕХОД К КОНКРЕТНОМУ СЛАЙДУ (при клике на индикатор)
    const progress = index / (this.slides.length - 1);  // Прогресс от 0 до 1
    const scrollTrigger = this.timeline.scrollTrigger;
    
    if (scrollTrigger) {
      // 📍 РАСЧЕТ ПОЗИЦИИ СКРОЛЛА для нужного слайда
      const targetScroll = scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
      
      // 🚀 ИНТЕГРАЦИЯ С LENIS: используем Lenis если доступен, иначе нативный скролл
      if (window.app && window.app.lenis) {
        // Lenis обеспечивает плавный контролируемый скролл
        window.app.lenis.scrollTo(targetScroll, {
          duration: 1.2,                              // Время анимации скролла
          easing: (t) => 1 - Math.pow(1 - t, 3)      // Кастомная функция плавности
        });
      } else {
        // Fallback на нативный браузерный скролл
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }
  
  // Method to refresh ScrollTrigger on resize
  refresh() {
    if (this.timeline && this.timeline.scrollTrigger) {
      this.timeline.scrollTrigger.refresh();
    }
  }
  
  // Method to destroy the component
  destroy() {
    if (this.timeline) {
      this.timeline.kill();
    }
    
    // Remove indicators
    const indicators = this.container.querySelector('.slide-indicators');
    if (indicators) {
      indicators.remove();
    }
  }
}

// Initialize function for global use
window.initCaseStudiesHorizontalScroll = () => {
  return new CaseStudiesHorizontalScroll();
};
