// =============================================================================
// Cursor Play Button - Магнитная кнопка play для hero секции
// =============================================================================

class CursorPlayButton {
    constructor() {
        this.isActive = false;
        this.isMobile = this.checkMobile();
        
        // Позиции и настройки
        this.mouse = { x: 0, y: 0 };
        this.pos = { x: 0, y: 0 };
        this.ratio = 0.12; // Плавность следования за курсором
        
        // Элементы
        this.button = null;
        this.content = null;
        
        // Callback для запуска видео
        this.onPlayCallback = null;
        
        // Глобальный обработчик клика
        this.globalClickHandler = null;
        
        this.init();
    }
    
    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }
    
    init() {
        // Не инициализируем на мобильных устройствах
        if (this.isMobile) {
            console.log('📱 Mobile device detected, cursor play button disabled');
            return;
        }
        
        this.createButton();
        this.setupEvents();
        
        console.log('🎬 CursorPlayButton initialized');
    }
    
    createButton() {
        // Создаем основной контейнер кнопки
        this.button = document.createElement('div');
        this.button.className = 'cursor-play-button';
        this.button.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 50;
            opacity: 0;
            transform: none;
            transition: opacity 0.3s ease;
        `;
        
        // Создаем контент кнопки (как на картинке)
        this.content = document.createElement('div');
        this.content.className = 'cursor-play-content';
        this.content.innerHTML = `
            <span class="cursor-play-text">Play</span>
            <span class="cursor-play-icon">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 2L9 6L3 10V2Z" fill="currentColor"/>
                </svg>
            </span>
        `;
        
        this.button.appendChild(this.content);
        document.body.appendChild(this.button);
        
        // console.log('✅ Cursor play button created');
    }
    
    setupEvents() {
        if (this.isMobile) return;
        
        // Отслеживание движения мыши
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Запуск анимационного цикла
        gsap.ticker.add(() => this.updatePosition());
        
        // console.log('✅ Cursor play button events setup');
    }
    
    updatePosition() {
        if (!this.isActive || this.isMobile) return;
        
        // Плавное следование за курсором с задержкой
        this.pos.x += (this.mouse.x - this.pos.x) * this.ratio;
        this.pos.y += (this.mouse.y - this.pos.y) * this.ratio;
        
        // Получаем высоту плашки для правильного позиционирования
        const buttonHeight = this.button.offsetHeight || 40; // fallback 40px
        
        // Применяем позицию со смещением: правее на 16px, выше на 16px + половина высоты
        gsap.set(this.button, {
            x: this.pos.x + 16,                    // Правее на 16px
            y: this.pos.y - 16 - (buttonHeight / 2) // Выше на 16px + центрирование по высоте
        });
    }
    
    // Добавление глобального обработчика клика
    addGlobalClickHandler() {
        if (this.isMobile) return;
        
        this.globalClickHandler = (e) => {
            if (this.isActive && this.onPlayCallback) {
                console.log('🎬 Global click detected - starting video');
                this.onPlayCallback();
            }
        };
        
        document.addEventListener('click', this.globalClickHandler);
        console.log('✅ Global click handler added');
    }
    
    // Удаление глобального обработчика клика
    removeGlobalClickHandler() {
        if (this.globalClickHandler) {
            document.removeEventListener('click', this.globalClickHandler);
            this.globalClickHandler = null;
            console.log('✅ Global click handler removed');
        }
    }
    
    // Активация кнопки (вызывается из hero-cube.js)
    activate(onPlayCallback) {
        if (this.isMobile) {
            // На мобильных показываем обычную фиксированную кнопку
            if (onPlayCallback) {
                onPlayCallback();
            }
            return;
        }
        
        this.isActive = true;
        this.onPlayCallback = onPlayCallback;
        
        // Устанавливаем начальную позицию в центр экрана
        this.pos.x = window.innerWidth / 2;
        this.pos.y = window.innerHeight / 2;
        
        // Показываем кнопку с анимацией (только как индикатор)
        gsap.to(this.button, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        });
        
        // Кнопка остается НЕ интерактивной (pointer-events: none)
        this.button.style.pointerEvents = 'none';
        
        // Добавляем глобальный обработчик клика
        this.addGlobalClickHandler();
        
        console.log('🎬 Cursor play button activated as indicator (global click enabled)');
    }
    
    // Деактивация кнопки
    deactivate() {
        if (this.isMobile) return;
        
        this.isActive = false;
        this.onPlayCallback = null;
        
        // Скрываем кнопку с анимацией
        gsap.to(this.button, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Убираем глобальный обработчик клика
        this.removeGlobalClickHandler();
        
        console.log('🎬 Cursor play button deactivated (global click disabled)');
    }
    
    // Проверка активности
    isActivated() {
        return this.isActive;
    }
    
    // Уничтожение экземпляра
    destroy() {
        // Убираем глобальный обработчик клика
        this.removeGlobalClickHandler();
        
        // Удаляем элемент из DOM
        if (this.button && this.button.parentNode) {
            this.button.parentNode.removeChild(this.button);
        }
        
        // Останавливаем анимационный цикл
        gsap.ticker.remove(this.updatePosition);
        
        // Сбрасываем состояние
        this.isActive = false;
        this.onPlayCallback = null;
        
        console.log('🎬 Cursor play button destroyed');
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.CursorPlayButton = CursorPlayButton;
}
