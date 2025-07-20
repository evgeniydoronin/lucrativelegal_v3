// =============================================================================
// Services Component - Refactored with AnimatedInteractiveComponent
// =============================================================================

/**
 * Services component with card scrolling effect and modal functionality
 * Demonstrates proper use of AnimatedInteractiveComponent architecture
 */

class Services extends AnimatedInteractiveComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Настройки анимаций
            animationDuration: 0.8,
            animationEase: 'power2.out',
            scrubValue: 2,
            anticipatePin: 1,
            // Настройки карточек
            cardHeightMultiplier: 150, // vh per card
            appearanceDuration: 0.35,
            disappearanceDuration: 0.25,
            // Настройки модального окна
            modalEnabled: true,
            modalLenisEnabled: false, // Отключаем Lenis в модальных окнах
            // Настройки компонента
            debug: false
        };
    }
    
    // =============================================================================
    // Lifecycle методы
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Конфигурация здесь (НЕ в constructor!)
        this.config = {
            refreshPriority: 1,
            animationDuration: this.options.animationDuration,
            // Другие настройки
        };
        
        // Инициализируем свойства
        this.mainTimeline = null;
        this.modalLenis = null;
        this.resizeTimeout = null;
        this.servicesData = null;
        
        this.log('debug', 'Services beforeInit - конфигурация готова');
    }
    
    setupElements() {
        super.setupElements();
        
        // Поиск основных элементов
        this.section = this.element;
        this.pinSpacer = this.$('.pin-spacer');
        this.cardsViewer = this.$('.js-cards-viewer');
        this.cards = this.$$('.js-card');
        this.clientNumberEl = this.$('.js-client-number');
        
        // Поиск модальных элементов
        this.modal = document.getElementById('service-modal');
        
        if (this.modal) {
            this.modalCloseBtn = this.modal.querySelector('.service-modal__close');
            this.modalContent = this.modal.querySelector('.service-modal__content');
        } else {
            console.warn('⚠️ Service modal not found in DOM');
        }
        
        // Валидация обязательных элементов
        if (!this.pinSpacer) {
            throw new Error('Pin spacer (.pin-spacer) not found');
        }
        
        if (!this.cardsViewer) {
            throw new Error('Cards viewer (.js-cards-viewer) not found');
        }
        
        if (this.cards.length === 0) {
            throw new Error('No service cards (.js-card) found');
        }
        
        this.log('info', `Found ${this.cards.length} service cards`);
        
        // Загружаем данные сервисов
        this.loadServicesData();
        
        return true;
    }
    
    bindEvents() {
        super.bindEvents();
        
        // Обработчики для карточек
        this.cards.forEach((card, index) => {
            this.addEventHandler(card, 'click', (event) => {
                this.handleCardClick(card, index, event);
            });
        });
        
        // Обработчики модального окна если включено
        if (this.options.modalEnabled && this.modal) {
            this.setupModalEvents();
        }
        
        // Обработчик resize с debounce
        this.addDebouncedEventHandler(window, 'resize', () => {
            this.handleResize();
        }, 250);
        
        // Обработчик load для refresh
        this.addEventHandler(window, 'load', () => {
            this.refreshScrollTrigger();
        });
    }
    
    setupAnimations() {
        // Получаем AnimationService
        this.animationService = window.AnimationService?.getInstance();
        
        if (!this.animationService) {
            console.warn('⚠️ AnimationService not available, using fallback');
            this.setupAnimationsFallback();
            return;
        }
        
        // Используем AnimationService для создания анимаций
        this.createScrollingEffect();
        this.log('info', 'Services animations setup completed');
    }
    
    afterInit() {
        super.afterInit();
        
        // Устанавливаем начальное состояние
        this.setupInitialState();
        
        // Логируем статистику если включен debug
        if (this.options.debug) {
            this.logComponentStats();
        }
        
        this.log('info', 'Services component fully initialized');
    }
    
    // =============================================================================
    // Методы настройки
    // =============================================================================
    
    loadServicesData() {
        const servicesDataScript = document.getElementById('llg-services-data');
        if (!servicesDataScript) {
            this.log('warn', 'Services data script not found');
            return;
        }
        
        try {
            this.servicesData = JSON.parse(servicesDataScript.textContent);
            this.log('info', 'Services data loaded successfully');
        } catch (error) {
            this.log('error', 'Error parsing services data:', error);
        }
    }
    
    setupInitialState() {
        // Вычисляем высоту spacer
        const spacerHeight = this.cards.length * this.options.cardHeightMultiplier;
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        const finalHeight = `calc(${spacerHeight}vh + ${headerHeight}px)`;
        this.pinSpacer.style.height = finalHeight;
        
        // Позиционируем viewer под header
        if (headerHeight) {
            this.cardsViewer.style.top = `${headerHeight}px`;
            this.cardsViewer.style.height = `calc(100vh - ${headerHeight}px)`;
        }
        
        // Устанавливаем начальное состояние карточек
        this.cards.forEach((card, index) => {
            const image = card.querySelector('.js-card-image');
            const description = card.querySelector('.js-card-description');
            const scrollTitle = card.querySelector('.js-scroll-title');
            
            // Оставляем карточки кликабельными - используем только opacity
            gsap.set(card, { 
                opacity: index === 0 ? 1 : 0  // Показываем первую карточку
            });
            
            gsap.set(image, { opacity: 0, y: 50 });
            gsap.set(description, { opacity: 0, x: 50 });
            
            if (scrollTitle) {
                gsap.set(scrollTitle, { opacity: 0, y: '75vh' });
            }
        });
        
        this.log('debug', 'Initial state configured');
    }
    
    setupModalEvents() {
        // Закрытие модального окна
        if (this.modalCloseBtn) {
            this.addEventHandler(this.modalCloseBtn, 'click', () => {
                this.hideModal();
            });
        }
        
        // ESC для закрытия
        this.addEventHandler(this.modal, 'cancel', (e) => {
            e.preventDefault();
            this.hideModal();
        });
        
        // Клик по backdrop
        this.addEventHandler(this.modal, 'click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
        
        this.log('debug', 'Modal events configured');
    }
    
    // =============================================================================
    // Методы анимаций
    // =============================================================================
    
    createScrollingEffect() {
        // Создаем главный timeline через AnimationService
        this.mainTimeline = this.animationService.scrollTriggerManager.createMasterTimeline({
            trigger: this.pinSpacer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: this.options.scrubValue,
            pin: this.cardsViewer,
            anticipatePin: this.options.anticipatePin,
            onUpdate: (self) => {
                this.updateCardCounter(self.progress);
                this.handleScrollUpdate(self);
            },
            onEnter: () => {
                this.cardsViewer.style.backgroundColor = '#000000';
                this.emit('scrollEntered');
            }
        });
        
        // Добавляем анимации для каждой карточки
        this.cards.forEach((card, index) => {
            this.createCardAnimation(card, index);
        });
        
        // Регистрируем timeline в AnimationService
        this.addAnimation(this.mainTimeline, 'main_scroll_timeline');
        
        this.log('info', 'Scrolling effect created');
    }
    
    createCardAnimation(card, index) {
        const image = card.querySelector('.js-card-image');
        const description = card.querySelector('.js-card-description');
        const scrollTitle = card.querySelector('.js-scroll-title');
        
        const totalCards = this.cards.length;
        const startTime = index / totalCards;
        const endTime = (index + 1) / totalCards;
        const duration = 1 / totalCards;
        
        const appearanceDuration = duration * this.options.appearanceDuration;
        const disappearanceDuration = duration * this.options.disappearanceDuration;
        
        // Появление карточки
        this.mainTimeline.to(card, {
            opacity: 1,
            visibility: 'visible',
            duration: appearanceDuration * 0.3,
            ease: this.options.animationEase
        }, startTime);
        
        // Анимация элементов
        this.mainTimeline.to(image, {
            opacity: 1,
            y: 0,
            x: 0,
            transform: "translate(-50%, -50%)",
            duration: appearanceDuration * 0.4,
            ease: this.options.animationEase
        }, startTime + appearanceDuration * 0.1);
        
        this.mainTimeline.to(description, {
            opacity: 1,
            x: 0,
            duration: appearanceDuration * 0.5,
            ease: this.options.animationEase
        }, startTime + appearanceDuration * 0.1);
        
        // Анимация скроллящегося заголовка
        if (scrollTitle) {
            this.mainTimeline.fromTo(scrollTitle, {
                opacity: 1,
                y: '75vh'
            }, {
                y: '-75vh',
                duration: duration,
                ease: 'none'
            }, startTime);
            
            this.mainTimeline.set(scrollTitle, { opacity: 1 }, startTime);
            
            if (index < totalCards - 1) {
                this.mainTimeline.set(scrollTitle, { opacity: 0 }, endTime);
            }
        }
        
        // Исчезновение карточки (кроме последней)
        if (index < totalCards - 1) {
            const disappearanceStart = endTime - disappearanceDuration;
            
            this.mainTimeline.to(description, {
                opacity: 0,
                x: -50,
                duration: disappearanceDuration * 0.5,
                ease: this.options.animationEase
            }, disappearanceStart);
            
            this.mainTimeline.to(image, {
                opacity: 0,
                y: 50,
                duration: disappearanceDuration * 0.4,
                ease: this.options.animationEase
            }, disappearanceStart + disappearanceDuration * 0.2);
            
            this.mainTimeline.to(card, {
                opacity: 0,
                visibility: 'hidden',
                duration: disappearanceDuration * 0.3,
                ease: this.options.animationEase
            }, disappearanceStart + disappearanceDuration * 0.7);
        }
    }
    
    setupAnimationsFallback() {
        // Fallback без AnimationService
        this.mainTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: this.pinSpacer,
                start: 'top top',
                end: 'bottom bottom',
                scrub: this.options.scrubValue,
                pin: this.cardsViewer,
                anticipatePin: this.options.anticipatePin,
                onUpdate: (self) => {
                    this.updateCardCounter(self.progress);
                },
                onEnter: () => {
                    this.cardsViewer.style.backgroundColor = '#000000';
                }
            }
        });
        
        // Создаем анимации карточек
        this.cards.forEach((card, index) => {
            this.createCardAnimation(card, index);
        });
        
        this.log('info', 'Fallback animations created');
    }
    
    // =============================================================================
    // Обработчики событий
    // =============================================================================
    
    handleCardClick(card, index, event) {
        this.log('info', `Service card clicked: ${index}`);
        
        if (!this.options.modalEnabled || !this.modal) {
            this.log('warn', 'Modal not available');
            return;
        }
        
        const serviceId = card.dataset.serviceId;
        if (!serviceId) {
            this.log('warn', 'Service ID not found on card');
            return;
        }
        
        this.showModal(serviceId);
        
        // Эмитируем событие
        this.emit('cardClicked', {
            card,
            index,
            serviceId,
            event
        });
    }
    
    handleScrollUpdate(self) {
        // Дополнительная логика при скролле
        this.emit('scrollUpdated', {
            progress: self.progress,
            direction: self.direction
        });
    }
    
    handleResize() {
        this.log('debug', 'Handling resize');
        
        // Пересчитываем размеры
        this.setupInitialState();
        
        // Обновляем ScrollTrigger
        this.refreshScrollTrigger();
        
        this.emit('resized');
    }
    
    // =============================================================================
    // Методы модального окна
    // =============================================================================
    
    showModal(serviceId) {
        if (!this.servicesData || !this.servicesData[serviceId]) {
            this.log('error', `Service data not found for: ${serviceId}`);
            return;
        }
        
        const serviceData = this.servicesData[serviceId];
        
        // Заполняем контент модального окна
        this.populateModalContent(serviceData, serviceId);
        
        // Сбрасываем позицию скролла
        if (this.modalContent) {
            this.modalContent.scrollTop = 0;
        }
        
        // Инициализируем Lenis для модального окна
        if (this.options.modalLenisEnabled && typeof Lenis !== 'undefined') {
            this.initModalLenis();
        }
        
        // Блокируем скролл body
        document.body.style.overflow = 'hidden';
        
        // Показываем модальное окно
        this.modal.showModal();
        
        this.emit('modalShown', { serviceId, serviceData });
        this.log('info', `Modal shown for service: ${serviceId}`);
    }
    
    hideModal() {
        // Очищаем Lenis
        if (this.modalLenis) {
            this.modalLenis.destroy();
            this.modalLenis = null;
        }
        
        // Восстанавливаем скролл body
        document.body.style.overflow = '';
        
        // Закрываем модальное окно
        this.modal.close();
        
        // Останавливаем видео
        this.stopModalMedia();
        
        this.emit('modalHidden');
        this.log('info', 'Modal hidden');
    }
    
    populateModalContent(serviceData, serviceId) {
        // Заполняем текстовый контент
        const elements = {
            '#service-modal-title': serviceData.title,
            '#service-modal-subtitle': serviceData.subtitle,
            '#service-modal-category': serviceData.category,
            '#service-modal-description': serviceData.description,
            '#service-modal-approach': `<p>${serviceData.approach}</p>`,
            '#service-modal-results': `<p>${serviceData.results}</p>`
        };
        
        Object.entries(elements).forEach(([selector, content]) => {
            const element = this.modal.querySelector(selector);
            if (element && content) {
                if (selector.includes('approach') || selector.includes('results')) {
                    element.innerHTML = content;
                } else {
                    element.textContent = content;
                }
            }
        });
        
        // Заполняем benefits
        const modalBenefits = this.modal.querySelector('#service-modal-benefits');
        if (modalBenefits && serviceData.benefits) {
            modalBenefits.innerHTML = serviceData.benefits
                .map(benefit => `<li>${benefit}</li>`)
                .join('');
        }
        
        // Устанавливаем изображение
        const modalImage = this.modal.querySelector('#service-modal-image');
        if (modalImage && serviceData.image) {
            modalImage.src = serviceData.image;
            modalImage.alt = serviceData.title;
        }
        
        // Применяем тему
        const themeElements = this.modal.querySelectorAll('[data-theme]');
        themeElements.forEach(element => {
            element.setAttribute('data-theme', serviceId);
        });
        
        // Устанавливаем видео
        this.setupModalMedia(serviceData);
    }
    
    setupModalMedia(serviceData) {
        // Локальное видео
        const modalVideo = this.modal.querySelector('#service-modal-video');
        if (modalVideo && serviceData.video) {
            const videoSource = modalVideo.querySelector('source');
            if (videoSource) {
                videoSource.src = serviceData.video;
                modalVideo.load();
            }
        }
        
        // YouTube видео
        const youtubeFrame = this.modal.querySelector('#service-modal-youtube');
        if (youtubeFrame && serviceData.youtube) {
            youtubeFrame.src = `https://www.youtube.com/embed/${serviceData.youtube}`;
        }
    }
    
    stopModalMedia() {
        // Останавливаем локальное видео
        const modalVideo = this.modal.querySelector('#service-modal-video');
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
        
        // Останавливаем YouTube видео
        const youtubeFrame = this.modal.querySelector('#service-modal-youtube');
        if (youtubeFrame) {
            youtubeFrame.src = '';
        }
    }
    
    initModalLenis() {
        if (!this.modalContent) return;
        
        this.modalLenis = new Lenis({
            wrapper: this.modalContent,
            content: this.modalContent,
            lerp: 0.1,
            duration: 1.2,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });
        
        // Запускаем RAF для Lenis
        const modalRaf = (time) => {
            // Проверяем что modalLenis существует перед вызовом raf
            if (this.modalLenis) {
                this.modalLenis.raf(time);
            }
            
            // Продолжаем RAF только если модальное окно открыто И Lenis существует
            if (this.modal.open && this.modalLenis) {
                requestAnimationFrame(modalRaf);
            }
        };
        requestAnimationFrame(modalRaf);
        
        this.log('debug', 'Modal Lenis initialized');
    }
    
    // =============================================================================
    // Утилитарные методы
    // =============================================================================
    
    updateCardCounter(progress) {
        if (!this.clientNumberEl) return;
        
        const totalCards = this.cards.length;
        const currentCard = Math.floor(progress * totalCards) + 1;
        const clampedCard = Math.min(currentCard, totalCards);
        const totalPadded = totalCards.toString().padStart(2, '0');
        
        this.clientNumberEl.innerHTML = 
            `<span class="js-client-number-units">${clampedCard.toString().padStart(2, '0')}</span>/${totalPadded}`;
    }
    
    refreshScrollTrigger() {
        if (this.animationService?.scrollTriggerManager) {
            this.animationService.scrollTriggerManager.refresh();
        } else {
            ScrollTrigger.refresh();
        }
    }
    
    logComponentStats() {
        const stats = {
            cards: this.cards.length,
            hasModal: !!this.modal,
            hasServicesData: !!this.servicesData,
            animationService: !!this.animationService
        };
        
        this.log('info', 'Component stats:', stats);
    }
    
    // =============================================================================
    // Публичные методы API
    // =============================================================================
    
    /**
     * Получить информацию о карточке сервиса
     */
    getCardInfo(index) {
        if (index < 0 || index >= this.cards.length) {
            return null;
        }
        
        const card = this.cards[index];
        const serviceId = card.dataset.serviceId;
        
        return {
            index,
            element: card,
            serviceId,
            data: this.servicesData?.[serviceId] || null,
            bounds: card.getBoundingClientRect()
        };
    }
    
    /**
     * Программно открыть модальное окно для сервиса
     */
    openServiceModal(serviceId) {
        if (!this.options.modalEnabled) {
            this.log('warn', 'Modal is disabled');
            return false;
        }
        
        this.showModal(serviceId);
        return true;
    }
    
    /**
     * Закрыть модальное окно
     */
    closeServiceModal() {
        if (this.modal && this.modal.open) {
            this.hideModal();
            return true;
        }
        return false;
    }
    
    /**
     * Получить текущий прогресс скролла
     */
    getScrollProgress() {
        if (this.mainTimeline) {
            return this.mainTimeline.progress();
        }
        return 0;
    }
    
    // НЕ вызываем super.getState() - его нет!
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            cardsCount: this.cards.length,
            hasModal: !!this.modal,
            modalOpen: this.modal?.open || false,
            hasTimeline: !!this.mainTimeline,
            scrollProgress: this.getScrollProgress(),
            hasServicesData: !!this.servicesData
        };
    }
    
    destroy() {
        // Очищаем modal Lenis
        if (this.modalLenis) {
            this.modalLenis.destroy();
            this.modalLenis = null;
        }
        
        // Очищаем timeline
        if (this.mainTimeline) {
            this.mainTimeline.kill();
            this.mainTimeline = null;
        }
        
        // Очищаем timeout
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
        }
        
        // Восстанавливаем body scroll если модальное окно открыто
        if (this.modal?.open) {
            document.body.style.overflow = '';
            this.modal.close();
        }
        
        // Очищаем данные
        this.servicesData = null;
        
        // ОБЯЗАТЕЛЬНО вызываем super.destroy()
        super.destroy();
        
        this.log('info', '🗑️ Services component destroyed');
    }
}

// =============================================================================
// Автоматическая инициализация
// =============================================================================

// Функция для автоматической инициализации
function initServicesNew() {
    const servicesElement = document.querySelector('.llg-services-section');
    
    if (!servicesElement) {
        console.warn('Services element not found');
        return null;
    }
    
    try {
        const services = new Services(servicesElement, {
            debug: true, // Включаем отладку для демонстрации
            modalEnabled: true,
            modalLenisEnabled: false // Отключаем Lenis в модальных окнах
        });
        
        // Добавляем глобальные слушатели событий для демонстрации
        services.on('cardClicked', (event) => {
            console.log('Service card clicked:', event.detail);
        });
        
        services.on('modalShown', (event) => {
            console.log('Service modal shown:', event.detail.serviceId);
        });
        
        services.on('scrollUpdated', (event) => {
            // console.log('Services scroll updated:', event.detail.progress);
        });
        
        return services;
    } catch (error) {
        console.error('Failed to initialize Services:', error);
        return null;
    }
}

// Экспорт для глобального использования
if (typeof window !== 'undefined') {
    window.Services = Services;
    window.initServicesNew = initServicesNew;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Services, initServicesNew };
}
