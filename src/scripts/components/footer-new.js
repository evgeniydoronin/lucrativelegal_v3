// =============================================================================
// Footer Component - Refactored Version
// =============================================================================

/**
 * Footer Component
 * Включает scroll-based анимации, hover эффекты и copyright анимации
 * 
 * Использует:
 * - AnimatedInteractiveComponent для базовой архитектуры
 * - Прямые GSAP вызовы для анимаций (без AnimationService)
 * - Правильный lifecycle и cleanup
 * - Fallback анимации для случаев без GSAP
 * - Accessibility поддержка (prefers-reduced-motion)
 */

class Footer extends AnimatedInteractiveComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Анимации
            widgetAnimationDuration: 0.8,
            widgetAnimationDelay: 0.2,
            copyrightAnimationDuration: 1.2,
            hoverAnimationDuration: 0.3,
            rotationDuration: 20,
            
            // ScrollTrigger настройки
            widgetTriggerStart: "top 85%",
            widgetTriggerEnd: "bottom 20%",
            copyrightTriggerStart: "top 90%",
            copyrightTriggerEnd: "bottom 20%",
            
            // Accessibility
            respectReducedMotion: true,
            
            // Debug
            debug: false
        };
    }
    
    // =============================================================================
    // Lifecycle Methods (BaseComponent)
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Состояние компонента
        this.state = {
            isAnimating: false,
            copyrightRotationActive: false,
            prefersReducedMotion: false
        };
        
        // Элементы (будут найдены в setupElements)
        this.elements = {
            footer: null,
            widgets: [],
            copyrightText: null,
            copyrightShape: null,
            socialLinks: [],
            footerLinks: [],
            yearElement: null
        };
        
        // Анимации
        this.widgetAnimations = [];
        this.hoverAnimations = new Map();
        this.copyrightRotation = null;
        
        // Проверяем настройки accessibility
        this.checkReducedMotionPreference();
        
        this.log('debug', 'Footer beforeInit - конфигурация готова');
        return true;
    }
    
    setupElements() {
        // Основные элементы
        this.elements.footer = this.element;
        this.elements.widgets = Array.from(
            this.element.querySelectorAll('.footer__widget')
        );
        this.elements.copyrightText = this.element.querySelector('.footer__copyright-text');
        this.elements.copyrightShape = this.element.querySelector('.footer__copyright-shape');
        
        // Интерактивные элементы
        this.elements.socialLinks = Array.from(
            this.element.querySelectorAll('.footer__social-link')
        );
        this.elements.footerLinks = Array.from(
            this.element.querySelectorAll('.footer__link')
        );
        
        // Год
        this.elements.yearElement = document.querySelector('.current-year');
        
        // Валидация критических элементов
        if (!this.elements.footer) {
            this.log('error', 'Footer element not found');
            return false;
        }
        
        this.log('info', 'Footer elements found', {
            widgets: this.elements.widgets.length,
            socialLinks: this.elements.socialLinks.length,
            footerLinks: this.elements.footerLinks.length,
            hasCopyright: !!this.elements.copyrightText,
            hasCopyrightShape: !!this.elements.copyrightShape
        });
        
        return true;
    }
    
    bindEvents() {
        // Hover эффекты для социальных ссылок
        this.bindSocialLinksEvents();
        
        // Hover эффекты для обычных ссылок
        this.bindFooterLinksEvents();
        
        // Отслеживание изменений настроек accessibility
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.addEventHandler(mediaQuery, 'change', this.handleReducedMotionChange.bind(this));
        }
        
        this.log('debug', 'Footer events bound');
    }
    
    setupAnimations() {
        if (!window.gsap) {
            this.log('warn', 'GSAP not available, using fallback animations');
            this.setupAnimationsFallback();
            return;
        }
        
        // Регистрируем ScrollTrigger если доступен
        if (window.gsap.registerPlugin && window.ScrollTrigger) {
            window.gsap.registerPlugin(window.ScrollTrigger);
        }
        
        // Создаем анимации
        this.createScrollAnimations();
        this.createCopyrightAnimation();
        
        this.log('info', 'Footer animations setup completed');
    }
    
    setupAnimationsFallback() {
        // Fallback анимации без GSAP
        this.log('info', 'Using fallback animations without GSAP');
        
        // Простые CSS классы для fallback
        this.elements.widgets.forEach((widget, index) => {
            setTimeout(() => {
                widget.style.opacity = '1';
                widget.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    afterInit() {
        // Обновляем текущий год
        this.updateCurrentYear();
        
        this.log('info', 'Footer component fully initialized', {
            widgetsCount: this.elements.widgets.length,
            prefersReducedMotion: this.state.prefersReducedMotion,
            hasGSAP: !!window.gsap
        });
    }
    
    // =============================================================================
    // Accessibility
    // =============================================================================
    
    checkReducedMotionPreference() {
        if (!this.options.respectReducedMotion) return;
        
        if (window.matchMedia) {
            this.state.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        
        this.log('debug', `Reduced motion preference: ${this.state.prefersReducedMotion}`);
    }
    
    handleReducedMotionChange(event) {
        this.state.prefersReducedMotion = event.matches;
        
        if (this.state.prefersReducedMotion && this.copyrightRotation) {
            // Останавливаем вращение если пользователь отключил анимации
            this.copyrightRotation.kill();
            this.copyrightRotation = null;
            this.state.copyrightRotationActive = false;
        }
        
        this.log('debug', `Reduced motion preference changed: ${this.state.prefersReducedMotion}`);
        this.emit('reducedMotionChanged', { prefersReducedMotion: this.state.prefersReducedMotion });
    }
    
    // =============================================================================
    // Scroll Animations
    // =============================================================================
    
    createScrollAnimations() {
        if (!window.gsap || !window.ScrollTrigger) return;
        
        // Анимация виджетов footer при скролле
        this.elements.widgets.forEach((widget, index) => {
            const animation = gsap.fromTo(widget, 
                {
                    opacity: 0,
                    y: 50,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: this.options.widgetAnimationDuration,
                    delay: index * this.options.widgetAnimationDelay,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: widget,
                        start: this.options.widgetTriggerStart,
                        end: this.options.widgetTriggerEnd,
                        toggleActions: "play none none reverse",
                        onStart: () => {
                            this.emit('widgetAnimationStart', { widget, index });
                        },
                        onComplete: () => {
                            this.emit('widgetAnimationComplete', { widget, index });
                        }
                    }
                }
            );
            
            this.widgetAnimations.push(animation);
        });
        
        this.log('debug', `Created ${this.widgetAnimations.length} widget animations`);
    }
    
    createCopyrightAnimation() {
        if (!window.gsap || !this.elements.copyrightText) return;
        
        // Анимация большого copyright текста
        gsap.fromTo(this.elements.copyrightText,
            {
                opacity: 0,
                scale: 0.8,
                y: 30
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: this.options.copyrightAnimationDuration,
                delay: 0.5,
                ease: "elastic.out(1, 0.8)",
                scrollTrigger: {
                    trigger: this.elements.copyrightText,
                    start: this.options.copyrightTriggerStart,
                    end: this.options.copyrightTriggerEnd,
                    toggleActions: "play none none reverse",
                    onStart: () => {
                        this.emit('copyrightAnimationStart');
                    },
                    onComplete: () => {
                        this.emit('copyrightAnimationComplete');
                    }
                }
            }
        );
        
        // Анимация декоративного изображения
        if (this.elements.copyrightShape) {
            gsap.fromTo(this.elements.copyrightShape,
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
                        trigger: this.elements.copyrightShape,
                        start: this.options.copyrightTriggerStart,
                        end: this.options.copyrightTriggerEnd,
                        toggleActions: "play none none reverse"
                    },
                    onComplete: () => {
                        this.startCopyrightRotation();
                    }
                }
            );
        }
        
        this.log('debug', 'Copyright animations created');
    }
    
    startCopyrightRotation() {
        if (!this.elements.copyrightShape || this.state.prefersReducedMotion) return;
        
        if (this.copyrightRotation) {
            this.copyrightRotation.kill();
        }
        
        this.copyrightRotation = gsap.to(this.elements.copyrightShape, {
            rotation: 360,
            duration: this.options.rotationDuration,
            ease: "none",
            repeat: -1
        });
        
        this.state.copyrightRotationActive = true;
        this.emit('copyrightRotationStart');
        this.log('debug', 'Copyright rotation started');
    }
    
    stopCopyrightRotation() {
        if (this.copyrightRotation) {
            this.copyrightRotation.kill();
            this.copyrightRotation = null;
            this.state.copyrightRotationActive = false;
            this.emit('copyrightRotationStop');
            this.log('debug', 'Copyright rotation stopped');
        }
    }
    
    // =============================================================================
    // Hover Effects
    // =============================================================================
    
    bindSocialLinksEvents() {
        this.elements.socialLinks.forEach((link, index) => {
            const icon = link.querySelector('svg');
            
            // Mouseenter
            this.addEventHandler(link, 'mouseenter', () => {
                this.animateSocialLinkHover(link, icon, true);
            });
            
            // Mouseleave
            this.addEventHandler(link, 'mouseleave', () => {
                this.animateSocialLinkHover(link, icon, false);
            });
            
            // Focus для accessibility
            this.addEventHandler(link, 'focus', () => {
                this.animateSocialLinkHover(link, icon, true);
            });
            
            // Blur для accessibility
            this.addEventHandler(link, 'blur', () => {
                this.animateSocialLinkHover(link, icon, false);
            });
        });
        
        this.log('debug', `Bound events for ${this.elements.socialLinks.length} social links`);
    }
    
    bindFooterLinksEvents() {
        this.elements.footerLinks.forEach((link, index) => {
            // Mouseenter
            this.addEventHandler(link, 'mouseenter', () => {
                this.animateFooterLinkHover(link, true);
            });
            
            // Mouseleave
            this.addEventHandler(link, 'mouseleave', () => {
                this.animateFooterLinkHover(link, false);
            });
            
            // Focus для accessibility
            this.addEventHandler(link, 'focus', () => {
                this.animateFooterLinkHover(link, true);
            });
            
            // Blur для accessibility
            this.addEventHandler(link, 'blur', () => {
                this.animateFooterLinkHover(link, false);
            });
        });
        
        this.log('debug', `Bound events for ${this.elements.footerLinks.length} footer links`);
    }
    
    animateSocialLinkHover(link, icon, isHover) {
        if (!window.gsap) {
            // Fallback без GSAP
            if (isHover) {
                link.style.transform = 'scale(1.1) translateY(-3px)';
                if (icon) icon.style.transform = 'rotate(360deg)';
            } else {
                link.style.transform = 'scale(1) translateY(0)';
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
            return;
        }
        
        // Останавливаем предыдущие анимации
        const existingAnimation = this.hoverAnimations.get(link);
        if (existingAnimation) {
            existingAnimation.kill();
        }
        
        if (isHover) {
            const timeline = gsap.timeline();
            
            timeline
                .to(link, {
                    scale: 1.1,
                    y: -3,
                    duration: this.options.hoverAnimationDuration,
                    ease: "power2.out"
                });
            
            if (icon) {
                timeline.to(icon, {
                    rotation: 360,
                    duration: 0.6,
                    ease: "power2.out"
                }, 0);
            }
            
            this.hoverAnimations.set(link, timeline);
        } else {
            const timeline = gsap.timeline();
            
            timeline
                .to(link, {
                    scale: 1,
                    y: 0,
                    duration: this.options.hoverAnimationDuration,
                    ease: "power2.out"
                });
            
            if (icon) {
                timeline.to(icon, {
                    rotation: 0,
                    duration: this.options.hoverAnimationDuration,
                    ease: "power2.out"
                }, 0);
            }
            
            this.hoverAnimations.set(link, timeline);
        }
    }
    
    animateFooterLinkHover(link, isHover) {
        if (!window.gsap) {
            // Fallback без GSAP
            link.style.transform = isHover ? 'translateX(5px)' : 'translateX(0)';
            return;
        }
        
        // Останавливаем предыдущие анимации
        const existingAnimation = this.hoverAnimations.get(link);
        if (existingAnimation) {
            existingAnimation.kill();
        }
        
        const animation = gsap.to(link, {
            x: isHover ? 5 : 0,
            duration: 0.2,
            ease: "power2.out"
        });
        
        this.hoverAnimations.set(link, animation);
    }
    
    // =============================================================================
    // Utility Methods
    // =============================================================================
    
    updateCurrentYear() {
        if (this.elements.yearElement) {
            const currentYear = new Date().getFullYear();
            this.elements.yearElement.textContent = currentYear;
            this.log('debug', `Updated current year to ${currentYear}`);
        }
    }
    
    refresh() {
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
            this.log('debug', 'ScrollTrigger refreshed');
        }
    }
    
    // =============================================================================
    // Public API Methods
    // =============================================================================
    
    /**
     * Получить текущее состояние footer
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            isAnimating: this.state.isAnimating,
            copyrightRotationActive: this.state.copyrightRotationActive,
            prefersReducedMotion: this.state.prefersReducedMotion,
            widgetAnimationsCount: this.widgetAnimations.length,
            hoverAnimationsCount: this.hoverAnimations.size
        };
    }
    
    /**
     * Принудительно обновить анимации
     */
    refreshAnimations() {
        this.refresh();
    }
    
    /**
     * Остановить все анимации
     */
    pauseAnimations() {
        this.widgetAnimations.forEach(animation => {
            if (animation.pause) animation.pause();
        });
        
        this.stopCopyrightRotation();
        
        this.emit('animationsPaused');
        this.log('debug', 'All animations paused');
    }
    
    /**
     * Возобновить все анимации
     */
    resumeAnimations() {
        this.widgetAnimations.forEach(animation => {
            if (animation.resume) animation.resume();
        });
        
        if (this.elements.copyrightShape && !this.state.prefersReducedMotion) {
            this.startCopyrightRotation();
        }
        
        this.emit('animationsResumed');
        this.log('debug', 'All animations resumed');
    }
    
    // =============================================================================
    // Cleanup (BaseComponent)
    // =============================================================================
    
    destroy() {
        // Останавливаем все анимации
        this.widgetAnimations.forEach(animation => {
            if (animation.kill) animation.kill();
        });
        this.widgetAnimations = [];
        
        // Останавливаем hover анимации
        this.hoverAnimations.forEach(animation => {
            if (animation.kill) animation.kill();
        });
        this.hoverAnimations.clear();
        
        // Останавливаем вращение copyright
        this.stopCopyrightRotation();
        
        // Убиваем все ScrollTrigger связанные с footer
        if (window.ScrollTrigger) {
            window.ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger && trigger.trigger.closest('.footer')) {
                    trigger.kill();
                }
            });
        }
        
        // Очищаем состояние
        this.state = {
            isAnimating: false,
            copyrightRotationActive: false,
            prefersReducedMotion: false
        };
        
        // Очищаем элементы
        this.elements = {
            footer: null,
            widgets: [],
            copyrightText: null,
            copyrightShape: null,
            socialLinks: [],
            footerLinks: [],
            yearElement: null
        };
        
        // Вызвать родительский destroy
        super.destroy();
        
        this.log('info', 'Footer component destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.Footer = Footer;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Footer;
}
