/**
 * Footer Component JavaScript
 * GSAP анимации для footer секции - портировано из v2.0
 */

class FooterAnimations {
    constructor() {
        this.footer = document.querySelector('.footer');
        this.widgets = document.querySelectorAll('.footer__widget');
        this.copyrightText = document.querySelector('.footer__copyright-text');
        this.copyrightShape = document.querySelector('.footer__copyright-shape');
        this.socialLinks = document.querySelectorAll('.footer__social-link');
        this.footerLinks = document.querySelectorAll('.footer__link');
        
        this.init();
    }

    init() {
        if (!this.footer) return;
        
        // Проверяем доступность GSAP
        if (typeof gsap === 'undefined') {
            console.warn('GSAP не загружен. Footer анимации отключены.');
            return;
        }
        
        // Регистрируем ScrollTrigger плагин
        if (gsap.registerPlugin && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupCopyrightAnimation();
        this.updateCurrentYear();
    }

    setupScrollAnimations() {
        // Анимация виджетов footer при скролле
        this.widgets.forEach((widget, index) => {
            gsap.fromTo(widget, 
                {
                    opacity: 0,
                    y: 50,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: widget,
                        start: "top 85%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });
    }

    setupCopyrightAnimation() {
        if (!this.copyrightText) return;

        // Анимация большого copyright текста
        gsap.fromTo(this.copyrightText,
            {
                opacity: 0,
                scale: 0.8,
                y: 30
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1.2,
                delay: 0.5,
                ease: "elastic.out(1, 0.8)",
                scrollTrigger: {
                    trigger: this.copyrightText,
                    start: "top 90%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Анимация декоративного изображения
        if (this.copyrightShape) {
            // Анимация появления
            gsap.fromTo(this.copyrightShape,
                {
                    opacity: 0,
                    x: 30,
                    scale: 0.8
                },
                {
                    opacity: 0.8,
                    x: 0,
                    scale: 1,
                    duration: 1,
                    delay: 1,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: this.copyrightShape,
                        start: "top 90%",
                        end: "bottom 20%",
                        toggleActions: "play none none reverse"
                    },
                    onComplete: () => {
                        // Проверяем настройки пользователя для анимаций
                        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                        
                        // После появления запускаем постоянное вращение только если пользователь не отключил анимации
                        if (!prefersReducedMotion) {
                            gsap.to(this.copyrightShape, {
                                rotation: 360,
                                duration: 20,
                                ease: "none",
                                repeat: -1
                            });
                        }
                    }
                }
            );
        }
    }

    setupHoverEffects() {
        // Hover эффекты для социальных ссылок
        this.socialLinks.forEach(link => {
            const icon = link.querySelector('svg');
            
            link.addEventListener('mouseenter', () => {
                gsap.to(link, {
                    scale: 1.1,
                    y: -3,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                if (icon) {
                    gsap.to(icon, {
                        rotation: 360,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
            });
            
            link.addEventListener('mouseleave', () => {
                gsap.to(link, {
                    scale: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                if (icon) {
                    gsap.to(icon, {
                        rotation: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });
        });

        // Hover эффекты для ссылок
        this.footerLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, {
                    x: 5,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });
            
            link.addEventListener('mouseleave', () => {
                gsap.to(link, {
                    x: 0,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });
        });
    }

    updateCurrentYear() {
        // Обновляем текущий год
        const yearElement = document.querySelector('.current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // Метод для обновления анимаций при изменении размера окна
    refresh() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }

    // Метод для уничтожения анимаций
    destroy() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger && trigger.trigger.closest('.footer')) {
                    trigger.kill();
                }
            });
        }
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Ждем загрузки GSAP
    const initFooterAnimations = () => {
        if (typeof gsap !== 'undefined') {
            window.footerAnimations = new FooterAnimations();
        } else {
            // Если GSAP еще не загружен, ждем еще немного
            setTimeout(initFooterAnimations, 100);
        }
    };
    
    initFooterAnimations();
});

// Обновление анимаций при изменении размера окна
window.addEventListener('resize', () => {
    if (window.footerAnimations) {
        window.footerAnimations.refresh();
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterAnimations;
}
