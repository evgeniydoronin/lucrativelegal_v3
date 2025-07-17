// =============================================================================
// Portfolio Section - LLG v3 (MWG_000 Animation Style)
// =============================================================================

// Глобальная функция инициализации (обязательно!)
window.initPortfolio = function() {
    'use strict';
    
    // console.log('🔧 DEBUG: initPortfolio() called');

    // Проверка зависимостей
    function checkDependencies() {
        if (typeof gsap === 'undefined') {
            console.error('❌ Portfolio: GSAP is not loaded.');
            return false;
        }
        
        if (typeof ScrollTrigger === 'undefined') {
            console.error('❌ Portfolio: ScrollTrigger is not loaded.');
            return false;
        }
        
        return true;
    }

    // Основной класс компонента
    class PortfolioClass {
        constructor(element) {
            this.element = element;
            
            // Переменные для отслеживания движения мыши (как в оригинале)
            this.oldX = 0;
            this.oldY = 0;
            this.deltaX = 0;
            this.deltaY = 0;
            
            this.setupElements();
            this.init();
        }
        
        setupElements() {
            this.portfolioGrid = this.element.querySelector('.portfolio-grid');
            this.portfolioItems = this.element.querySelectorAll('.portfolio-item');
            
            if (!this.portfolioGrid || this.portfolioItems.length === 0) {
                console.error('❌ Portfolio: Required elements not found');
                return false;
            }
            
            return true;
        }
        
        init() {
            if (!this.setupElements()) return;
            
            this.setupMouseTracking();
            this.setupHoverAnimations();
            this.setupScrollTrigger();
            console.log('✅ Portfolio initialized with MWG_000 style animations');
        }

        setupMouseTracking() {
            // Точно как в оригинальном примере MWG_000
            this.element.addEventListener("mousemove", (e) => {
                // Calculate horizontal movement since the last mouse position
                this.deltaX = e.clientX - this.oldX;

                // Calculate vertical movement since the last mouse position
                this.deltaY = e.clientY - this.oldY;

                // Update old coordinates with the current mouse position
                this.oldX = e.clientX;
                this.oldY = e.clientY;
            });
        }
        
        setupHoverAnimations() {
            // Применяем анимацию к каждому элементу портфолио
            this.portfolioItems.forEach(item => {
                // Add an event listener for when the mouse enters each media
                item.addEventListener('mouseenter', () => {
                    this.animateItem(item);
                });
            });
        }
        
        animateItem(item) {
            const image = item.querySelector('img');
            if (!image) return;
            
            // Точная копия логики из оригинального MWG_000
            const tl = gsap.timeline({ 
                onComplete: () => {
                    tl.kill();
                }
            });
            
            tl.timeScale(1.2); // Animation will play 20% faster than normal
            
            // Инерционное движение (адаптация без InertiaPlugin)
            tl.to(image, {
                duration: 0.5,
                x: this.deltaX * 2, // Уменьшенный радиус разлета
                y: this.deltaY * 2, // Уменьшенный радиус разлета
                ease: "power2.out"
            });
            
            // Возврат в исходное положение с эластичным эффектом
            tl.to(image, {
                duration: 0.6,
                x: 0, // Go back to the initial position
                y: 0, // Go back to the initial position
                ease: "elastic.out(1, 0.5)"
            });
            
            // Случайное вращение с yoyo эффектом (точно как в оригинале)
            tl.fromTo(image, {
                rotate: 0
            }, {
                duration: 0.4,
                rotate: (Math.random() - 0.5) * 30, // Returns a value between -15 & 15 (как в оригинале)
                yoyo: true, 
                repeat: 1,
                ease: 'power1.inOut' // Will slow at the begin and the end
            }, '<'); // Means that the animation starts at the same time as the previous tween
        }
        
        setupScrollTrigger() {
            gsap.registerPlugin(ScrollTrigger);
            
            // Простая анимация появления сетки
            ScrollTrigger.create({
                trigger: this.portfolioGrid,
                start: 'top 80%',
                onEnter: () => {
                    this.animateGridEntrance();
                }
            });
        }
        
        animateGridEntrance() {
            // Анимация появления элементов сетки
            gsap.fromTo(this.portfolioItems, {
                opacity: 0,
                y: 60,
                scale: 0.9
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }
        
        destroy() {
            // Cleanup ScrollTrigger
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === this.element || trigger.trigger === this.portfolioGrid) {
                    trigger.kill();
                }
            });
            
            // Cleanup GSAP анимации
            gsap.killTweensOf(this.portfolioItems);
            gsap.killTweensOf(this.element);
        }
    }

    // Инициализация с проверками
    if (!checkDependencies()) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    const element = document.querySelector('#portfolio');
    if (element) {
        new PortfolioClass(element);
    } else {
        console.warn('⚠️ Portfolio element not found');
    }
    
    // Refresh ScrollTrigger после загрузки всех ресурсов
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
}
