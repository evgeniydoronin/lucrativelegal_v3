# 🚨 Проблема #006: Дублирование обработчиков событий

## 📊 Статус решения
- [x] Проблема проанализирована
- [ ] Решение спроектировано  
- [ ] Код реализован
- [ ] Тесты написаны
- [ ] Документация обновлена
- [ ] Проблема решена ✅

**Приоритет:** 🟡 Важный  
**Оценка времени:** 2-3 дня  
**Ответственный:** [имя]  
**Дата создания:** 19.01.2025  
**Последнее обновление:** 19.01.2025

## 🎯 Описание проблемы

### Основная проблема
Множественные обработчики событий создаются неэффективно, что приводит к:
- **Дублированию addEventListener** на одних элементах
- **Отсутствию делегирования событий** для динамических элементов
- **Проблемам с производительностью** при большом количестве обработчиков
- **Утечкам памяти** из-за неочищенных обработчиков

### Критичность
Проблема **снижает производительность** и может вызывать **утечки памяти**.

## 📊 Метрики и статистика

### Найдено addEventListener вызовов: **85+**
### Дублированных паттернов: **32**

**По компонентам:**
- `header.js`: 18 обработчиков событий
- `hero-cube.js`: 8 обработчиков (но сложных)
- `services.js`: 12 обработчиков
- `portfolio.js`: 6 обработчиков
- `case-studies.js`: 15 обработчиков (на каждый слайд)
- `future-marketing.js`: 4 обработчика
- `footer.js`: 8 обработчиков
- `section-navigation.js`: 6 обработчиков
- `scroll-to-top.js`: 3 обработчика
- `cursor-play-button.js`: 5 обработчиков

### Проблемные паттерны:
- **Множественные обработчики** на одном элементе
- **Отсутствие делегирования** для списков элементов
- **Неочищенные обработчики** при destroy
- **Дублированная логика** обработки событий

## 🔍 Конкретные примеры кода

### Пример 1: Множественные обработчики на одном элементе
```javascript
// ❌ ПРОБЛЕМА: Несколько addEventListener на одном элементе

// header.js
document.addEventListener('click', function(event) {
    if (!event.target.closest('.header__nav')) {
        // Закрытие dropdown
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isOffcanvasOpen) {
        closeOffcanvas();
    }
});

window.addEventListener('resize', function() {
    if (window.innerWidth > 767 && isOffcanvasOpen) {
        closeOffcanvas();
    }
});

// И еще много других обработчиков на document и window...
```

### Пример 2: Отсутствие делегирования событий
```javascript
// ❌ ПРОБЛЕМА: Обработчик на каждый элемент вместо делегирования

// case-studies.js
slides.forEach(slide => {
    const slideContent = slide.querySelector('.slide-content');
    
    // Отдельный обработчик для каждого слайда
    indicator.addEventListener('click', () => {
        this.goToSlide(index);
    });
    
    indicator.addEventListener('mouseenter', () => {
        if (!indicator.classList.contains('active')) {
            // Hover логика
        }
    });
    
    indicator.addEventListener('mouseleave', () => {
        if (!indicator.classList.contains('active')) {
            // Hover логика
        }
    });
});

// services.js
cards.forEach(card => {
    // Отдельный обработчик для каждой карточки
    card.addEventListener('click', () => {
        const serviceId = card.dataset.serviceId;
        showModal(serviceId);
    });
});
```

### Пример 3: Неочищенные обработчики
```javascript
// ❌ ПРОБЛЕМА: Обработчики не очищаются при destroy

// scroll-to-top.js
class ScrollToTop {
    init() {
        // Добавляем обработчики
        this.button.addEventListener('click', this.handleClick);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
    }
    
    destroy() {
        // Очищаем только некоторые обработчики
        if (this.button) {
            this.button.removeEventListener('click', this.handleClick);
            // ❌ Забыли очистить scroll и resize!
        }
    }
}

// portfolio.js
class PortfolioClass {
    init() {
        this.element.addEventListener("mousemove", this.handleMouseMove);
        
        this.portfolioItems.forEach(item => {
            item.addEventListener('mouseenter', this.handleItemEnter);
        });
    }
    
    destroy() {
        // ❌ Вообще не очищаем обработчики!
        if (this.portfolioItems) {
            gsap.killTweensOf(this.portfolioItems);
        }
    }
}
```

### Пример 4: Дублированная логика обработки
```javascript
// ❌ ПРОБЛЕМА: Одинаковая логика в разных компонентах

// header.js
function handleEscapeKey(event) {
    if (event.key === 'Escape' && isOffcanvasOpen) {
        closeOffcanvas();
    }
}

// services.js
modal.addEventListener('cancel', (e) => {
    e.preventDefault(); // Prevent default ESC behavior
    hideModal();
});

// section-navigation.js
this.navigation.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Escape logic
    }
});
```

### Пример 5: Неэффективная обработка resize
```javascript
// ❌ ПРОБЛЕМА: Множественные resize обработчики без debounce

// header.js
window.addEventListener('resize', function() {
    if (window.innerWidth > 767 && isOffcanvasOpen) {
        closeOffcanvas();
    }
});

// future-marketing.js
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        handleResize();
    }, 250);
});

// services.js
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        handleResize();
    }, 250);
});

// main.js
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        this.handleResize();
    }, 250);
});
```

## 💡 Предлагаемое решение

### 1. Централизованный EventManager
```javascript
// src/core/EventManager.js
class EventManager {
    static instance = null;
    
    constructor() {
        if (EventManager.instance) {
            return EventManager.instance;
        }
        
        this.handlers = new Map();
        this.delegatedHandlers = new Map();
        this.globalHandlers = new Map();
        this.debounceTimers = new Map();
        
        this.setupGlobalDelegation();
        EventManager.instance = this;
    }
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new EventManager();
        }
        return this.instance;
    }
    
    // Добавление обычного обработчика
    on(element, event, handler, options = {}) {
        const key = this.generateKey(element, event);
        
        // Удаляем предыдущий обработчик если есть
        if (this.handlers.has(key)) {
            this.off(element, event);
        }
        
        // Обертка для автоматической очистки
        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error('Event handler error:', error);
            }
        };
        
        element.addEventListener(event, wrappedHandler, options);
        
        this.handlers.set(key, {
            element,
            event,
            handler: wrappedHandler,
            originalHandler: handler,
            options
        });
        
        return this;
    }
    
    // Удаление обработчика
    off(element, event) {
        const key = this.generateKey(element, event);
        const stored = this.handlers.get(key);
        
        if (stored) {
            stored.element.removeEventListener(stored.event, stored.handler, stored.options);
            this.handlers.delete(key);
        }
        
        return this;
    }
    
    // Делегирование событий
    delegate(container, selector, event, handler) {
        const key = `${container}_${selector}_${event}`;
        
        if (this.delegatedHandlers.has(key)) {
            console.warn('Delegated handler already exists:', key);
            return this;
        }
        
        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target && container.contains(target)) {
                try {
                    handler.call(target, e, target);
                } catch (error) {
                    console.error('Delegated handler error:', error);
                }
            }
        };
        
        container.addEventListener(event, delegatedHandler);
        
        this.delegatedHandlers.set(key, {
            container,
            selector,
            event,
            handler: delegatedHandler,
            originalHandler: handler
        });
        
        return this;
    }
    
    // Удаление делегированного обработчика
    undelegate(container, selector, event) {
        const key = `${container}_${selector}_${event}`;
        const stored = this.delegatedHandlers.get(key);
        
        if (stored) {
            stored.container.removeEventListener(stored.event, stored.handler);
            this.delegatedHandlers.delete(key);
        }
        
        return this;
    }
    
    // Debounced обработчики
    debounce(element, event, handler, delay = 250, options = {}) {
        const key = this.generateKey(element, event);
        
        const debouncedHandler = (e) => {
            const timerId = this.debounceTimers.get(key);
            if (timerId) {
                clearTimeout(timerId);
            }
            
            this.debounceTimers.set(key, setTimeout(() => {
                try {
                    handler(e);
                } catch (error) {
                    console.error('Debounced handler error:', error);
                }
                this.debounceTimers.delete(key);
            }, delay));
        };
        
        return this.on(element, event, debouncedHandler, options);
    }
    
    // Throttled обработчики
    throttle(element, event, handler, delay = 16, options = {}) {
        const key = this.generateKey(element, event);
        let lastCall = 0;
        
        const throttledHandler = (e) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                try {
                    handler(e);
                } catch (error) {
                    console.error('Throttled handler error:', error);
                }
            }
        };
        
        return this.on(element, event, throttledHandler, options);
    }
    
    // Глобальные обработчики (window, document)
    global(target, event, handler, options = {}) {
        const element = typeof target === 'string' ? 
            (target === 'window' ? window : document) : target;
        
        const key = `global_${target}_${event}`;
        
        if (this.globalHandlers.has(key)) {
            // Объединяем обработчики вместо замены
            const existing = this.globalHandlers.get(key);
            const combinedHandler = (e) => {
                existing.handler(e);
                handler(e);
            };
            
            element.removeEventListener(event, existing.handler, existing.options);
            element.addEventListener(event, combinedHandler, options);
            
            this.globalHandlers.set(key, {
                element,
                event,
                handler: combinedHandler,
                options
            });
        } else {
            element.addEventListener(event, handler, options);
            this.globalHandlers.set(key, {
                element,
                event,
                handler,
                options
            });
        }
        
        return this;
    }
    
    // Настройка глобального делегирования
    setupGlobalDelegation() {
        // Глобальное делегирование для кликов
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });
        
        // Глобальное делегирование для клавиатуры
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });
        
        // Оптимизированный resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleGlobalResize();
            }, 250);
        });
    }
    
    handleGlobalClick(e) {
        // Обработка глобальных кликов (закрытие модалов, dropdown и т.д.)
        this.emit('global:click', e);
    }
    
    handleGlobalKeydown(e) {
        // Обработка глобальных клавиш (Escape, Enter и т.д.)
        if (e.key === 'Escape') {
            this.emit('global:escape', e);
        }
        
        this.emit('global:keydown', e);
    }
    
    handleGlobalResize() {
        this.emit('global:resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }
    
    // Система событий
    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
    
    listen(eventName, handler) {
        document.addEventListener(eventName, handler);
    }
    
    unlisten(eventName, handler) {
        document.removeEventListener(eventName, handler);
    }
    
    // Утилитарные методы
    generateKey(element, event) {
        return `${element.tagName || 'unknown'}_${element.id || 'no-id'}_${event}`;
    }
    
    // Очистка всех обработчиков для элемента
    cleanup(element) {
        // Очистка обычных обработчиков
        for (const [key, handler] of this.handlers) {
            if (handler.element === element) {
                this.off(element, handler.event);
            }
        }
        
        // Очистка делегированных обработчиков
        for (const [key, handler] of this.delegatedHandlers) {
            if (handler.container === element) {
                this.undelegate(handler.container, handler.selector, handler.event);
            }
        }
    }
    
    // Получение статистики
    getStats() {
        return {
            handlers: this.handlers.size,
            delegatedHandlers: this.delegatedHandlers.size,
            globalHandlers: this.globalHandlers.size,
            activeDebounceTimers: this.debounceTimers.size
        };
    }
}
```

### 2. Интеграция с BaseComponent
```javascript
// Обновление BaseComponent для использования EventManager
class BaseComponent {
    constructor(element, options = {}) {
        // ... существующий код
        this.events = EventManager.getInstance();
    }
    
    // Упрощенные методы для работы с событиями
    on(event, handler, options = {}) {
        return this.events.on(this.element, event, handler, options);
    }
    
    off(event) {
        return this.events.off(this.element, event);
    }
    
    delegate(selector, event, handler) {
        return this.events.delegate(this.element, selector, event, handler);
    }
    
    debounce(event, handler, delay = 250) {
        return this.events.debounce(this.element, event, handler, delay);
    }
    
    throttle(event, handler, delay = 16) {
        return this.events.throttle(this.element, event, handler, delay);
    }
    
    // Глобальные события
    onGlobal(eventName, handler) {
        this.events.listen(eventName, handler);
    }
    
    offGlobal(eventName, handler) {
        this.events.unlisten(eventName, handler);
    }
    
    // Автоматическая очистка при destroy
    destroy() {
        this.events.cleanup(this.element);
        super.destroy();
    }
}
```

### 3. Примеры использования

#### Простое использование в компоненте:
```javascript
class Portfolio extends BaseComponent {
    bindEvents() {
        // Простой обработчик
        this.on('click', (e) => {
            console.log('Portfolio clicked');
        });
        
        // Делегирование для динамических элементов
        this.delegate('.portfolio-item', 'click', (e, item) => {
            this.handleItemClick(item);
        });
        
        // Debounced resize
        this.debounce('resize', () => {
            this.handleResize();
        }, 300);
        
        // Глобальные события
        this.onGlobal('global:escape', () => {
            this.closeModal();
        });
    }
}
```

#### Оптимизация существующего кода:
```javascript
// До оптимизации (case-studies.js):
slides.forEach((slide, index) => {
    const indicator = indicators[index];
    indicator.addEventListener('click', () => this.goToSlide(index));
    indicator.addEventListener('mouseenter', () => this.handleHover(index));
    indicator.addEventListener('mouseleave', () => this.handleLeave(index));
});

// После оптимизации:
this.delegate('.slide-indicator', 'click', (e, indicator) => {
    const index = Array.from(indicators).indexOf(indicator);
    this.goToSlide(index);
});

this.delegate('.slide-indicator', 'mouseenter', (e, indicator) => {
    const index = Array.from(indicators).indexOf(indicator);
    this.handleHover(index);
});

this.delegate('.slide-indicator', 'mouseleave', (e, indicator) => {
    const index = Array.from(indicators).indexOf(indicator);
    this.handleLeave(index);
});
```

## 🔗 Связанные проблемы

- [005-component-architecture.md](005-component-architecture.md) - Архитектура компонентов
- [003-performance-optimization.md](003-performance-optimization.md) - Проблемы производительности

## 🔗 Связанные решения

- [base-component-architecture.md](../solutions/base-component-architecture.md) - Базовая архитектура компонентов

## 📝 План реализации

### Этап 1: Создание EventManager
- [ ] Создать базовый EventManager
- [ ] Реализовать делегирование событий
- [ ] Добавить debounce/throttle функциональность
- [ ] Написать unit тесты

### Этап 2: Интеграция с BaseComponent
- [ ] Обновить BaseComponent
- [ ] Добавить методы для работы с событиями
- [ ] Реализовать автоматическую очистку

### Этап 3: Миграция компонентов
- [ ] Мигрировать case-studies.js (много обработчиков)
- [ ] Мигрировать header.js (сложная логика)
- [ ] Мигрировать services.js (делегирование)
- [ ] Мигрировать остальные компоненты

### Этап 4: Оптимизация
- [ ] Оптимизировать глобальные обработчики
- [ ] Добавить мониторинг производительности
- [ ] Провести нагрузочное тестирование

## 🧪 Критерии успеха

- [ ] addEventListener вызовов сокращено с 85+ до <30
- [ ] Все списки элементов используют делегирование
- [ ] Отсутствуют утечки памяти от обработчиков
- [ ] Глобальные события оптимизированы
- [ ] Производительность событий улучшена на 40%

## ⚠️ Риски

- **Средний:** Сложность отладки делегированных событий
- **Средний:** Возможные breaking changes в существующей логике
- **Низкий:** Увеличение сложности кода

## 📈 Ожидаемые улучшения

### До рефакторинга:
- addEventListener вызовов: 85+
- Утечки памяти: Есть
- Производительность событий: Низкая
- Дублированная логика: 32 паттерна

### После рефакторинга:
- addEventListener вызовов: <30 (-65%)
- Утечки памяти: Отсутствуют
- Производительность событий: Высокая (+40%)
- Дублированная логика: <8 паттернов (-75%)

## 📚 Дополнительные ресурсы

- [Event Delegation Best Practices](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_delegation)
- [Memory Leaks in JavaScript](https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/)
- [Debouncing and Throttling](https://css-tricks.com/debouncing-throttling-explained-examples/)
