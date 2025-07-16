// Главный менеджер приложения с оптимизированной загрузкой анимаций
class App {
    constructor() {
        this.modules = {};
        this.animationManager = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeModules();
        });
    }

    initializeModules() {
        // Регистрируем GSAP ScrollTrigger
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            console.log('✅ GSAP ScrollTrigger зарегистрирован');
        }

        // Инициализация модуля прокрутки между секциями
        this.modules.sectionsScroll = new ScrollManager();

        // Инициализация менеджера анимаций
        this.animationManager = new AnimationManager();

        // Регистрация всех анимаций в менеджере
        this.registerAnimations();

        console.log('✅ Все модули инициализированы с оптимизированной загрузкой');
        console.log('📊 Статистика AnimationManager:', this.animationManager.getStats());
    }

    registerAnimations() {
        // Hero Ripple - загружается немедленно
        this.animationManager.registerAnimation('hero', {
            animationClass: 'HeroRipple',
            priority: this.animationManager.loadPriorities.IMMEDIATE,
            initParams: {
                imageSrc: document.querySelector('.hero-ripple')?.getAttribute('data-background')
            },
            resourceIntensive: true,
            dependencies: []
        });

        // Three.js анимации удалены - используем только GSAP для максимальной производительности

        // Заготовки для будущих анимаций (секции 6-11)
        this.registerFutureAnimations();

        console.log('📝 Все анимации зарегистрированы в AnimationManager');
    }

    registerFutureAnimations() {
        // Секция 6: Services - GSAP анимация (оптимизированная)
        this.animationManager.registerAnimation('services', {
            animationClass: 'GSAPServices',
            priority: this.animationManager.loadPriorities.LAZY,
            initParams: {},
            resourceIntensive: false, // GSAP намного легче Three.js
            dependencies: [
                { type: 'script', src: 'js/gsap-services.js' }
            ]
        });

        // Секция 7: Lawyer Types
        this.animationManager.registerAnimation('lawyer-types', {
            animationClass: 'LawyerTypesAnimation', // Будет создан позже
            priority: this.animationManager.loadPriorities.LAZY,
            initParams: {},
            resourceIntensive: false,
            dependencies: []
        });

        // Секция 8: Portfolio
        this.animationManager.registerAnimation('portfolio', {
            animationClass: 'PortfolioAnimation', // Будет создан позже
            priority: this.animationManager.loadPriorities.LAZY,
            initParams: {},
            resourceIntensive: true,
            dependencies: []
        });

        // Секция 9: About
        this.animationManager.registerAnimation('about', {
            animationClass: 'AboutAnimation', // Будет создан позже
            priority: this.animationManager.loadPriorities.LAZY,
            initParams: {},
            resourceIntensive: false,
            dependencies: []
        });

        // Секция 10: Blog
        this.animationManager.registerAnimation('blog', {
            animationClass: 'BlogAnimation', // Будет создан позже
            priority: this.animationManager.loadPriorities.LAZY,
            initParams: {},
            resourceIntensive: false,
            dependencies: []
        });

        // Секция 11: Testimonials
        this.animationManager.registerAnimation('testimonials', {
            animationClass: 'TestimonialsAnimation', // Будет создан позже
            priority: this.animationManager.loadPriorities.LAZY,
            initParams: {},
            resourceIntensive: false,
            dependencies: []
        });

        console.log('🔮 Заготовки для будущих анимаций зарегистрированы');
    }

    // Метод для получения модуля
    getModule(name) {
        return this.modules[name];
    }

    // Метод для добавления нового модуля
    addModule(name, module) {
        this.modules[name] = module;
    }

    // Метод для получения менеджера анимаций
    getAnimationManager() {
        return this.animationManager;
    }

    // Метод для получения статистики производительности
    getPerformanceStats() {
        if (this.animationManager) {
            return this.animationManager.getStats();
        }
        return null;
    }

    // Метод для принудительной очистки ресурсов
    cleanupResources() {
        if (this.animationManager) {
            this.animationManager.cleanupResources();
        }
    }
}

// Глобальная инициализация приложения
window.app = new App();

// Добавляем глобальные методы для отладки
window.getAnimationStats = () => {
    return window.app.getPerformanceStats();
};

window.cleanupAnimations = () => {
    window.app.cleanupResources();
    console.log('🧹 Принудительная очистка ресурсов выполнена');
};
