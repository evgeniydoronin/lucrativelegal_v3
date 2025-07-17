/**
 * Header Navigation System
 * Включает scroll-based поведение, dropdown меню и offcanvas
 * Основано на layout/index.php с адаптацией под v3.0 архитектуру
 */

// State management
let isOffcanvasOpen = false;
let lastScrollY = 0;
let headerElement = null;
let tl = null;

/**
 * Инициализация header
 */
function initHeader() {
  console.log('🔧 Инициализация header navigation system...');
  
  headerElement = document.querySelector('.header');
  
  if (!headerElement) {
    console.warn('⚠️ Элемент .header не найден');
    return;
  }
  
  // Инициализируем scroll-based поведение
  initScrollBehavior();
  
  // Инициализируем dropdown меню
  initDropdownMenus();
  
  // Инициализируем offcanvas меню
  initOffcanvasMenu();
  
  // Инициализируем мобильную навигацию
  initMobileNavigation();
  
  // Инициализируем плавную навигацию
  initSmoothNavigation();
  
  // Инициализируем GSAP анимации
  initHeaderAnimations();
  
  console.log('✅ Header navigation system инициализирован');
}

/**
 * Scroll-based поведение header
 */
function initScrollBehavior() {
  const scrollHandler = debounce(function() {
    const currentScrollY = window.scrollY;
    const isScrolled = currentScrollY > 50;
    
    // Переключаем классы в зависимости от скролла
    if (isScrolled) {
      headerElement.classList.remove('header--transparent');
      headerElement.classList.add('header--scrolled');
      
      // GSAP анимация для смены логотипа
      if (window.gsap) {
        gsap.to('.header__logo-white', { 
          opacity: 0, 
          duration: 0.3,
          onComplete: () => {
            gsap.set('.header__logo-white', { display: 'none' });
            gsap.set('.header__logo-black', { display: 'block', opacity: 0 });
            gsap.to('.header__logo-black', { opacity: 1, duration: 0.3 });
          }
        });
      }
    } else {
      headerElement.classList.add('header--transparent');
      headerElement.classList.remove('header--scrolled');
      
      // GSAP анимация для смены логотипа
      if (window.gsap) {
        gsap.to('.header__logo-black', { 
          opacity: 0, 
          duration: 0.3,
          onComplete: () => {
            gsap.set('.header__logo-black', { display: 'none' });
            gsap.set('.header__logo-white', { display: 'block', opacity: 0 });
            gsap.to('.header__logo-white', { opacity: 1, duration: 0.3 });
          }
        });
      }
    }
    
    lastScrollY = currentScrollY;
  }, 10);
  
  // Устанавливаем начальное состояние
  if (window.scrollY <= 50) {
    headerElement.classList.add('header--transparent');
    headerElement.classList.remove('header--scrolled');
  } else {
    headerElement.classList.remove('header--transparent');
    headerElement.classList.add('header--scrolled');
  }
  
  window.addEventListener('scroll', scrollHandler);
  
  console.log('✅ Scroll-based поведение header инициализировано');
}

/**
 * Dropdown меню
 */
function initDropdownMenus() {
  const dropdownItems = document.querySelectorAll('.header__nav .has-dropdown');
  
  dropdownItems.forEach(item => {
    const submenu = item.querySelector('.header__submenu');
    
    if (!submenu) return;
    
    let hoverTimeout;
    
    // Показать dropdown при hover
    item.addEventListener('mouseenter', function() {
      clearTimeout(hoverTimeout);
      
      // GSAP анимация появления
      if (window.gsap) {
        gsap.set(submenu, { display: 'block' });
        gsap.fromTo(submenu, 
          { 
            opacity: 0, 
            y: -10, 
            scale: 0.95 
          },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.3, 
            ease: "power2.out" 
          }
        );
      } else {
        submenu.style.display = 'block';
        setTimeout(() => {
          submenu.classList.add('show');
        }, 10);
      }
    });
    
    // Скрыть dropdown при уходе мыши
    item.addEventListener('mouseleave', function() {
      if (window.gsap) {
        gsap.to(submenu, {
          opacity: 0,
          y: -10,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(submenu, { display: 'none' });
          }
        });
      } else {
        submenu.classList.remove('show');
        hoverTimeout = setTimeout(() => {
          submenu.style.display = 'none';
        }, 300);
      }
    });
    
    // Обработка многоуровневых меню
    const nestedDropdowns = item.querySelectorAll('.menu-item-has-children');
    nestedDropdowns.forEach(nestedItem => {
      const nestedSubmenu = nestedItem.querySelector('.header__submenu');
      
      if (!nestedSubmenu) return;
      
      let nestedTimeout;
      
      nestedItem.addEventListener('mouseenter', function() {
        clearTimeout(nestedTimeout);
        
        if (window.gsap) {
          gsap.set(nestedSubmenu, { display: 'block' });
          gsap.fromTo(nestedSubmenu, 
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, duration: 0.2 }
          );
        } else {
          nestedSubmenu.style.display = 'block';
          setTimeout(() => {
            nestedSubmenu.classList.add('show');
          }, 10);
        }
      });
      
      nestedItem.addEventListener('mouseleave', function() {
        if (window.gsap) {
          gsap.to(nestedSubmenu, {
            opacity: 0,
            x: -10,
            duration: 0.2,
            onComplete: () => {
              gsap.set(nestedSubmenu, { display: 'none' });
            }
          });
        } else {
          nestedSubmenu.classList.remove('show');
          nestedTimeout = setTimeout(() => {
            nestedSubmenu.style.display = 'none';
          }, 300);
        }
      });
    });
  });
  
  // Закрытие dropdown при клике вне меню
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.header__nav')) {
      const openDropdowns = document.querySelectorAll('.header__submenu.show');
      openDropdowns.forEach(dropdown => {
        if (window.gsap) {
          gsap.to(dropdown, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            onComplete: () => {
              gsap.set(dropdown, { display: 'none' });
            }
          });
        } else {
          dropdown.classList.remove('show');
          setTimeout(() => {
            dropdown.style.display = 'none';
          }, 300);
        }
      });
    }
  });
  
  console.log('✅ Dropdown меню инициализированы');
}

/**
 * Offcanvas мобильное меню
 */
function initOffcanvasMenu() {
  const openBtn = document.querySelector('.header__offcanvas-open-btn');
  const closeBtn = document.querySelector('.header__offcanvas-close-btn');
  const offcanvas = document.querySelector('.header__offcanvas-area');
  const overlay = document.querySelector('.body-overlay');
  
  if (!openBtn || !closeBtn || !offcanvas || !overlay) {
    console.warn('⚠️ Элементы offcanvas меню не найдены');
    return;
  }
  
  // Открытие offcanvas
  openBtn.addEventListener('click', function() {
    openOffcanvas();
  });
  
  // Закрытие offcanvas
  closeBtn.addEventListener('click', function() {
    closeOffcanvas();
  });
  
  // Закрытие при клике на overlay
  overlay.addEventListener('click', function() {
    closeOffcanvas();
  });
  
  // Закрытие при нажатии Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isOffcanvasOpen) {
      closeOffcanvas();
    }
  });
  
  // Закрытие при изменении размера окна
  window.addEventListener('resize', function() {
    if (window.innerWidth > 767 && isOffcanvasOpen) {
      closeOffcanvas();
    }
  });
  
  function openOffcanvas() {
    isOffcanvasOpen = true;
    
    // GSAP анимация открытия
    if (window.gsap) {
      const tl = gsap.timeline();
      
      tl.set(offcanvas, { display: 'block' })
        .set(overlay, { display: 'block' })
        .fromTo(overlay, 
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        )
        .fromTo(offcanvas, 
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: "power2.out" },
          "-=0.1"
        )
        .fromTo('.header__offcanvas-content, .header__offcanvas-menu, .header__offcanvas-contact, .header__offcanvas-social',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 },
          "-=0.2"
        );
    } else {
      offcanvas.classList.add('open');
      overlay.classList.add('active');
    }
    
    document.body.style.overflow = 'hidden';
    
    // Анимация кнопки hamburger
    animateHamburger(openBtn, true);
    
    console.log('📱 Offcanvas меню открыто');
  }
  
  function closeOffcanvas() {
    isOffcanvasOpen = false;
    
    // GSAP анимация закрытия
    if (window.gsap) {
      const tl = gsap.timeline();
      
      tl.to('.header__offcanvas-content, .header__offcanvas-menu, .header__offcanvas-contact, .header__offcanvas-social',
          { opacity: 0, y: -20, duration: 0.2, stagger: 0.05 }
        )
        .to(offcanvas, 
          { x: '100%', duration: 0.3, ease: "power2.in" },
          "-=0.1"
        )
        .to(overlay, 
          { opacity: 0, duration: 0.2 },
          "-=0.2"
        )
        .set([offcanvas, overlay], { display: 'none' });
    } else {
      offcanvas.classList.remove('open');
      overlay.classList.remove('active');
    }
    
    document.body.style.overflow = '';
    
    // Анимация кнопки hamburger
    animateHamburger(openBtn, false);
    
    console.log('📱 Offcanvas меню закрыто');
  }
  
  console.log('✅ Offcanvas меню инициализировано');
}

/**
 * Анимация hamburger кнопки
 */
function animateHamburger(button, isOpen) {
  const lines = button.querySelectorAll('i');
  
  if (lines.length !== 3) return;
  
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

/**
 * Мобильная навигация в offcanvas
 */
function initMobileNavigation() {
  const mobileMenuItems = document.querySelectorAll('.header__mobile-menu .has-dropdown');
  
  mobileMenuItems.forEach(item => {
    const link = item.querySelector(':scope > a');
    const submenu = item.querySelector('.header__mobile-submenu');
    
    if (!link || !submenu) return;
    
    // Добавляем индикатор dropdown
    const indicator = document.createElement('span');
    indicator.innerHTML = '+';
    indicator.style.cssText = 'float: right; cursor: pointer; font-size: 18px; line-height: 1; transition: transform 0.3s;';
    link.appendChild(indicator);
    
    // Скрываем submenu по умолчанию
    submenu.style.display = 'none';
    
    // Обработчик клика
    link.addEventListener('click', function(event) {
      event.preventDefault();
      
      const isOpen = submenu.style.display === 'block';
      
      // Закрываем все другие submenu
      mobileMenuItems.forEach(otherItem => {
        const otherSubmenu = otherItem.querySelector('.header__mobile-submenu');
        const otherIndicator = otherItem.querySelector(':scope > a span');
        if (otherSubmenu && otherSubmenu !== submenu) {
          if (window.gsap) {
            gsap.to(otherSubmenu, {
              height: 0,
              opacity: 0,
              duration: 0.3,
              onComplete: () => {
                otherSubmenu.style.display = 'none';
              }
            });
          } else {
            otherSubmenu.style.display = 'none';
          }
          if (otherIndicator) {
            otherIndicator.innerHTML = '+';
            if (window.gsap) {
              gsap.to(otherIndicator, { rotation: 0, duration: 0.3 });
            }
          }
        }
      });
      
      // Переключаем текущий submenu
      if (isOpen) {
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
      } else {
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
    });
    
    // Обработка вложенных submenu
    const nestedItems = submenu.querySelectorAll('.menu-item-has-children');
    nestedItems.forEach(nestedItem => {
      const nestedLink = nestedItem.querySelector(':scope > a');
      const nestedSubmenu = nestedItem.querySelector('.header__mobile-submenu');
      
      if (!nestedLink || !nestedSubmenu) return;
      
      const nestedIndicator = document.createElement('span');
      nestedIndicator.innerHTML = '+';
      nestedIndicator.style.cssText = 'float: right; cursor: pointer; font-size: 16px; line-height: 1; transition: transform 0.3s;';
      nestedLink.appendChild(nestedIndicator);
      
      nestedSubmenu.style.display = 'none';
      
      nestedLink.addEventListener('click', function(event) {
        event.preventDefault();
        
        const isNestedOpen = nestedSubmenu.style.display === 'block';
        
        if (isNestedOpen) {
          if (window.gsap) {
            gsap.to(nestedSubmenu, {
              height: 0,
              opacity: 0,
              duration: 0.3,
              onComplete: () => {
                nestedSubmenu.style.display = 'none';
              }
            });
            gsap.to(nestedIndicator, { rotation: 0, duration: 0.3 });
          } else {
            nestedSubmenu.style.display = 'none';
          }
          nestedIndicator.innerHTML = '+';
        } else {
          nestedSubmenu.style.display = 'block';
          if (window.gsap) {
            gsap.fromTo(nestedSubmenu, 
              { height: 0, opacity: 0 },
              { height: 'auto', opacity: 1, duration: 0.3 }
            );
            gsap.to(nestedIndicator, { rotation: 45, duration: 0.3 });
          }
          nestedIndicator.innerHTML = '−';
        }
      });
    });
  });
  
  console.log('✅ Мобильная навигация инициализирована');
}

/**
 * Плавная навигация
 */
function initSmoothNavigation() {
  const navLinks = document.querySelectorAll('.header__nav a[href^="#"], .header__mobile-menu a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = headerElement.offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        if (window.gsap) {
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
        if (isOffcanvasOpen) {
          const closeBtn = document.querySelector('.header__offcanvas-close-btn');
          if (closeBtn) closeBtn.click();
        }
      }
    });
  });
  
  console.log('✅ Плавная навигация инициализирована');
}

/**
 * GSAP анимации для header
 */
function initHeaderAnimations() {
  if (!window.gsap) {
    console.warn('⚠️ GSAP не найден, анимации отключены');
    return;
  }
  
  // Анимация появления header при загрузке
  gsap.fromTo(headerElement, 
    { y: -100, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
  );
  
  // Анимация логотипа при загрузке
  gsap.fromTo('.header__logo img', 
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.4 }
  );
  
  // Анимация навигационных элементов
  gsap.fromTo('.header__nav nav ul li', 
    { y: -20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.6 }
  );
  
  // Анимация кнопки
  gsap.fromTo('.header__btn-box', 
    { x: 20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.8 }
  );
  
  console.log('✅ GSAP анимации header инициализированы');
}

/**
 * Debounce функция для оптимизации производительности
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Публичные методы для внешнего использования
 */
const headerAPI = {
  closeOffcanvas: function() {
    if (isOffcanvasOpen) {
      const closeBtn = document.querySelector('.header__offcanvas-close-btn');
      if (closeBtn) closeBtn.click();
    }
  },
  
  isOffcanvasOpen: function() {
    return isOffcanvasOpen;
  },
  
  scrollToTop: function() {
    if (window.gsap) {
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
  },
  
  updateHeaderState: function() {
    const currentScrollY = window.scrollY;
    const isScrolled = currentScrollY > 50;
    
    if (isScrolled) {
      headerElement.classList.remove('header--transparent');
      headerElement.classList.add('header--scrolled');
    } else {
      headerElement.classList.add('header--transparent');
      headerElement.classList.remove('header--scrolled');
    }
  }
};

// Make functions globally available
window.initHeader = initHeader;
window.headerAPI = headerAPI;
