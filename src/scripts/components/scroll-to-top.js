// =============================================================================
// Scroll to Top Button Component
// =============================================================================

class ScrollToTop {
    constructor() {
        this.button = document.getElementById('scroll-to-top');
        this.scrollThreshold = 300; // Показывать кнопку после 300px скролла
        this.isVisible = false;
        
        if (!this.button) {
            console.warn('⚠️ Scroll to top button not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        // console.log('🔝 Initializing Scroll to Top button');
        
        // Привязываем обработчики событий
        this.bindEvents();
        
        // Проверяем начальное состояние
        this.checkScrollPosition();
        
        console.log('✅ Scroll to Top button initialized');
    }
    
    bindEvents() {
        // Клик по кнопке
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });
        
        // Отслеживание скролла для показа/скрытия кнопки
        window.addEventListener('scroll', () => {
            this.checkScrollPosition();
        });
        
        // Отслеживание скролла через Lenis если доступен
        if (window.app && window.app.lenis) {
            window.app.lenis.on('scroll', () => {
                this.checkScrollPosition();
            });
        }
    }
    
    checkScrollPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > this.scrollThreshold && !this.isVisible) {
            this.showButton();
        } else if (scrollTop <= this.scrollThreshold && this.isVisible) {
            this.hideButton();
        }
    }
    
    showButton() {
        this.isVisible = true;
        this.button.classList.add('visible');
        
        // Анимация появления с небольшой задержкой для плавности
        requestAnimationFrame(() => {
            this.button.style.opacity = '1';
            this.button.style.transform = 'translateY(0) scale(1)';
        });
    }
    
    hideButton() {
        this.isVisible = false;
        this.button.classList.remove('visible');
        
        // Анимация исчезновения
        this.button.style.opacity = '0';
        this.button.style.transform = 'translateY(20px) scale(0.8)';
    }
    
    scrollToTop() {
        console.log('🚀 Scrolling to top instantly');
        
        // 🔄 СБРОС СОСТОЯНИЯ HERO-CUBE перед скроллом
        this.resetHeroCubeState();
        
        // МГНОВЕННЫЙ скролл к hero секции (не плавный!)
        const heroSection = document.getElementById('hero');
        
        if (heroSection) {
            // Если доступен Lenis - используем его для мгновенного скролла
            if (window.app && window.app.lenis) {
                // Мгновенный скролл через Lenis (duration: 0)
                window.app.lenis.scrollTo(heroSection, {
                    duration: 0,
                    immediate: true
                });
            } else {
                // Fallback к нативному мгновенному скроллу
                heroSection.scrollIntoView({
                    behavior: 'auto', // Мгновенно, не плавно!
                    block: 'start'
                });
            }
        } else {
            // Fallback к скроллу в самый верх страницы
            if (window.app && window.app.lenis) {
                window.app.lenis.scrollTo(0, {
                    duration: 0,
                    immediate: true
                });
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'auto' // Мгновенно!
                });
            }
        }
        
        // Добавляем визуальную обратную связь (кратковременная анимация)
        this.addClickFeedback();
    }
    
    // Сброс состояния hero-cube для предотвращения автопоказа видео
    resetHeroCubeState() {
        // Ищем экземпляр hero-cube в глобальном приложении
        if (window.app && window.app.heroCube && typeof window.app.heroCube.resetVideoState === 'function') {
            console.log('🔄 Вызываем сброс состояния hero-cube');
            window.app.heroCube.resetVideoState();
        } else {
            // Fallback: ищем hero-cube через DOM
            const heroElement = document.getElementById('hero');
            if (heroElement && heroElement.heroCubeInstance) {
                console.log('🔄 Вызываем сброс состояния hero-cube (fallback)');
                heroElement.heroCubeInstance.resetVideoState();
            } else {
                console.log('⚠️ Hero-cube экземпляр не найден для сброса состояния');
            }
        }
    }
    
    addClickFeedback() {
        const buttonElement = this.button.querySelector('.scroll-to-top__button');
        
        // Добавляем класс для анимации клика
        buttonElement.classList.add('clicked');
        
        // Убираем класс через короткое время
        setTimeout(() => {
            buttonElement.classList.remove('clicked');
        }, 200);
    }
    
    // Метод для программного показа/скрытия кнопки
    toggle(force) {
        if (typeof force === 'boolean') {
            if (force) {
                this.showButton();
            } else {
                this.hideButton();
            }
        } else {
            if (this.isVisible) {
                this.hideButton();
            } else {
                this.showButton();
            }
        }
    }
    
    // Метод для изменения порога появления кнопки
    setThreshold(newThreshold) {
        this.scrollThreshold = newThreshold;
        this.checkScrollPosition(); // Перепроверяем текущую позицию
    }
}

// Функция инициализации для использования в main.js
function initScrollToTop() {
    return new ScrollToTop();
}

// Делаем доступным глобально
window.initScrollToTop = initScrollToTop;

// Экспорт для модульного использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollToTop;
}
