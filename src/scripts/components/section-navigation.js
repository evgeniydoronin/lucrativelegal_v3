// =============================================================================
// Section Navigation Component
// =============================================================================

class SectionNavigation {
    constructor() {
        this.navigation = document.getElementById('section-navigation');
        this.navItems = [];
        this.sections = [];
        this.currentActiveSection = 'hero';
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        // Throttling для производительности
        this.lastUpdate = 0;
        this.updateThrottle = 100; // 100ms между обновлениями
        
        if (!this.navigation) {
            console.warn('⚠️ Section navigation not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        console.log('🧭 Initializing Section Navigation');
        
        // Собираем элементы навигации и секции
        this.collectElements();
        
        // Привязываем обработчики событий
        this.bindEvents();
        
        // Настраиваем отслеживание секций
        this.setupSectionObserver();
        
        // Проверяем начальное состояние
        this.updateActiveSection();
        
        console.log('✅ Section Navigation initialized');
    }
    
    collectElements() {
        // Собираем все элементы навигации
        this.navItems = Array.from(this.navigation.querySelectorAll('.section-nav-item'));
        
        // Собираем все секции на странице
        this.sections = this.navItems.map(item => {
            const sectionId = item.dataset.section;
            const sectionElement = document.getElementById(sectionId);
            
            if (!sectionElement) {
                console.warn(`⚠️ Section not found: ${sectionId}`);
                return null;
            }
            
            return {
                id: sectionId,
                element: sectionElement,
                navItem: item,
                title: item.dataset.title
            };
        }).filter(Boolean); // Убираем null значения
        
        console.log(`📋 Found ${this.sections.length} sections for navigation`);
    }
    
    bindEvents() {
        // Клики по элементам навигации
        this.navItems.forEach(item => {
            const button = item.querySelector('.section-nav-button');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sectionId = item.dataset.section;
                    this.scrollToSection(sectionId);
                });
            }
        });
        
        // Keyboard navigation
        this.navigation.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // Отслеживание скролла для обновления активной секции
        this.setupScrollTracking();
        
        console.log('✅ Section navigation events bound');
    }
    
    setupScrollTracking() {
        // Отслеживание через нативный scroll
        window.addEventListener('scroll', () => {
            this.throttledUpdateActiveSection();
        });
        
        // Отслеживание через Lenis если доступен
        if (window.app && window.app.lenis) {
            window.app.lenis.on('scroll', () => {
                this.throttledUpdateActiveSection();
            });
        }
    }
    
    throttledUpdateActiveSection() {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateThrottle) {
            return; // Пропускаем обновление если прошло меньше 100ms
        }
        this.lastUpdate = now;
        
        // Используем requestAnimationFrame для плавности
        requestAnimationFrame(() => {
            this.updateActiveSection();
        });
    }
    
    setupSectionObserver() {
        // Intersection Observer для более точного отслеживания
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', // Активируем когда секция в центре экрана
            threshold: 0
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
        this.sections.forEach(section => {
            this.sectionObserver.observe(section.element);
        });
    }
    
    updateActiveSection() {
        if (this.isScrolling) return; // Не обновляем во время программного скролла
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const centerPoint = scrollTop + (windowHeight / 2);
        
        let activeSection = null;
        let minDistance = Infinity;
        
        // Находим секцию ближайшую к центру экрана
        this.sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionCenter = sectionTop + (rect.height / 2);
            const distance = Math.abs(centerPoint - sectionCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                activeSection = section.id;
            }
        });
        
        if (activeSection && activeSection !== this.currentActiveSection) {
            this.setActiveSection(activeSection);
        }
    }
    
    setActiveSection(sectionId) {
        if (sectionId === this.currentActiveSection) return;
        
        // Убираем активный класс со всех элементов
        this.navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Добавляем активный класс к текущей секции
        const activeItem = this.navItems.find(item => item.dataset.section === sectionId);
        if (activeItem) {
            activeItem.classList.add('active');
            this.currentActiveSection = sectionId;
            
            // Логирование для отладки
            const sectionData = this.sections.find(s => s.id === sectionId);
            if (sectionData) {
                console.log(`🧭 Active section: ${sectionData.title} (${sectionId})`);
            }
        }
    }
    
    scrollToSection(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) {
            console.warn(`⚠️ Section not found: ${sectionId}`);
            return;
        }
        
        console.log(`🧭 Navigating to section: ${section.title} (${sectionId})`);
        
        // ✅ ИСПРАВЛЕНО: Универсальная деактивация магнитной кнопки при переходе к ЛЮБОЙ секции
        if (window.cursorPlayButton && window.cursorPlayButton.isActivated()) {
            console.log('🎬 Деактивируем магнитную кнопку при переходе к секции:', sectionId);
            window.cursorPlayButton.deactivate();
            
            // Сбрасываем состояние hero-cube для корректной работы
            if (window.app && window.app.heroCube) {
                window.app.heroCube.playButtonActivated = false;
                console.log('🔄 Сброшен флаг playButtonActivated в hero-cube');
            }
        }
        
        // ✅ ИСПРАВЛЕНО: Полный сброс состояния hero-cube при переходе к ЛЮБОЙ секции через навигацию
        console.log('🔄 Section Navigation: Сброс состояния hero-cube при переходе к секции:', sectionId);
        this.resetHeroCubeState();
        
        // Устанавливаем флаг программного скролла
        this.isScrolling = true;
        
        // Очищаем предыдущий таймаут
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // Используем Lenis для плавного скролла если доступен
        if (window.app && window.app.lenis) {
            window.app.lenis.scrollTo(section.element, {
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                onComplete: () => {
                    this.isScrolling = false;
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
                this.isScrolling = false;
            }, 1500);
        }
        
        // Немедленно обновляем активную секцию
        this.setActiveSection(sectionId);
        
        // Добавляем визуальную обратную связь
        this.addClickFeedback(sectionId);
    }
    
    addClickFeedback(sectionId) {
        const navItem = this.navItems.find(item => item.dataset.section === sectionId);
        if (!navItem) return;
        
        const button = navItem.querySelector('.section-nav-button');
        if (!button) return;
        
        // Добавляем класс для анимации клика
        button.classList.add('clicked');
        
        // Убираем класс через короткое время
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    }
    
    // ✅ НОВОЕ: Сброс состояния hero-cube для предотвращения автопоказа видео (как в scroll-to-top)
    resetHeroCubeState() {
        // Ищем экземпляр hero-cube в глобальном приложении
        if (window.app && window.app.heroCube && typeof window.app.heroCube.resetVideoState === 'function') {
            console.log('🔄 Section Navigation: Вызываем сброс состояния hero-cube с флагом навигации');
            window.app.heroCube.resetVideoState(true); // ✅ Передаем флаг навигации
        } else {
            // Fallback: ищем hero-cube через DOM
            const heroElement = document.getElementById('hero');
            if (heroElement && heroElement.heroCubeInstance) {
                console.log('🔄 Section Navigation: Вызываем сброс состояния hero-cube (fallback) с флагом навигации');
                heroElement.heroCubeInstance.resetVideoState(true); // ✅ Передаем флаг навигации
            } else {
                console.log('⚠️ Section Navigation: Hero-cube экземпляр не найден для сброса состояния');
            }
        }
    }
    
    handleKeyboardNavigation(e) {
        const currentIndex = this.navItems.findIndex(item => 
            item.dataset.section === this.currentActiveSection
        );
        
        let targetIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                targetIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                targetIndex = Math.min(this.navItems.length - 1, currentIndex + 1);
                break;
            case 'Home':
                e.preventDefault();
                targetIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                targetIndex = this.navItems.length - 1;
                break;
            default:
                return; // Не обрабатываем другие клавиши
        }
        
        if (targetIndex !== currentIndex) {
            const targetSection = this.navItems[targetIndex].dataset.section;
            this.scrollToSection(targetSection);
        }
    }
    
    // Метод для программного перехода к секции (для внешнего использования)
    goToSection(sectionId) {
        this.scrollToSection(sectionId);
    }
    
    // Метод для получения текущей активной секции
    getCurrentSection() {
        return this.currentActiveSection;
    }
    
    // Метод для получения всех секций
    getSections() {
        return this.sections.map(section => ({
            id: section.id,
            title: section.title
        }));
    }
    
    // Уничтожение экземпляра
    destroy() {
        // Отключаем Intersection Observer
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        
        // Очищаем таймауты
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // Убираем обработчики событий
        window.removeEventListener('scroll', this.throttledUpdateActiveSection);
        
        if (window.app && window.app.lenis) {
            window.app.lenis.off('scroll', this.throttledUpdateActiveSection);
        }
        
        console.log('🧭 Section Navigation destroyed');
    }
}

// Функция инициализации для использования в main.js
function initSectionNavigation() {
    return new SectionNavigation();
}

// Делаем доступным глобально
window.initSectionNavigation = initSectionNavigation;

// Экспорт для модульного использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionNavigation;
}
