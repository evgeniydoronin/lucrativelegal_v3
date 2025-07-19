# 🚨 Проблема #001: GSAP ScrollTrigger конфликты

## 📊 Статус решения
- [x] Проблема проанализирована
- [ ] Решение спроектировано  
- [ ] Код реализован
- [ ] Тесты написаны
- [ ] Документация обновлена
- [ ] Проблема решена ✅

**Приоритет:** 🔴 Критический  
**Оценка времени:** 2-3 дня  
**Ответственный:** [имя]  
**Дата создания:** 19.01.2025  
**Последнее обновление:** 19.01.2025

## 🎯 Описание проблемы

### Основная проблема
Множественные ScrollTrigger экземпляры создаются для одних и тех же элементов, что вызывает:
- **Конфликты анимаций** - элементы "прыгают" между состояниями
- **Падение производительности** - избыточные вычисления на каждом кадре
- **Невозможность добавления новых анимаций** - система перегружена

### Критичность
Эта проблема **блокирует добавление новых GSAP анимаций** и является основной причиной тормозов.

## 📊 Метрики и статистика

### Найдено ScrollTrigger вызовов: **164**

**По компонентам:**
- `hero-cube.js`: 15 вызовов ScrollTrigger.create
- `services.js`: 12 вызовов gsap.timeline + ScrollTrigger
- `portfolio.js`: 8 вызовов ScrollTrigger.create
- `case-studies.js`: 18 вызовов (множественные на слайдах)
- `future-marketing.js`: 6 вызовов
- `footer.js`: 8 вызовов
- `word-animator.js`: 12 вызовов
- И другие компоненты...

### Проблемные паттерны:
```javascript
// ❌ ПЛОХО: Множественные ScrollTrigger на одном элементе
ScrollTrigger.create({ trigger: element, ... });
ScrollTrigger.create({ trigger: element, ... }); // Конфликт!
ScrollTrigger.create({ trigger: element, ... }); // Еще конфликт!
```

## 🔍 Конкретные примеры кода

### Пример 1: hero-cube.js (строка 200+)
```javascript
// ❌ ПРОБЛЕМА: Один ScrollTrigger управляет всем
ScrollTrigger.create({
    trigger: this.element,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
        this.checkPositioningMode();      // Тяжелые вычисления
        this.updateCubeRotation(self);    // Еще тяжелые вычисления
        this.handleScaleEffect();         // И еще...
        this.updateTextVisibility();     // И еще...
    }
});
```

### Пример 2: case-studies.js
```javascript
// ❌ ПРОБЛЕМА: ScrollTrigger для каждого слайда
slides.forEach(slide => {
    ScrollTrigger.create({
        trigger: slide,
        onEnter: () => { /* анимация */ },
        onLeave: () => { /* анимация */ },
        onEnterBack: () => { /* анимация */ },
        onLeaveBack: () => { /* анимация */ }
    });
});
```

### Пример 3: services.js
```javascript
// ❌ ПРОБЛЕМА: Timeline + ScrollTrigger для каждой карточки
const mainTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: container,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1
    }
});
```

## 💡 Предлагаемое решение

### 1. Централизованный AnimationService
```javascript
class AnimationService {
    static instance = null;
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new AnimationService();
        }
        return this.instance;
    }
    
    // Единый ScrollTrigger менеджер
    createScrollAnimation(config) {
        return ScrollTrigger.create({
            ...this.defaultScrollConfig,
            ...config,
            refreshPriority: this.getNextPriority()
        });
    }
}
```

### 2. Объединение анимаций в Timeline
```javascript
// ✅ ХОРОШО: Один Timeline для всех анимаций элемента
const masterTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: true
    }
});

// Добавляем все анимации в один timeline
masterTimeline
    .to(element1, { opacity: 1 })
    .to(element2, { x: 100 }, "<0.2")
    .to(element3, { scale: 1.2 }, "<0.1");
```

### 3. Batch обработка элементов
```javascript
// ✅ ХОРОШО: ScrollTrigger.batch для множественных элементов
ScrollTrigger.batch(".slide", {
    onEnter: elements => gsap.from(elements, {opacity: 0, y: 50}),
    onLeave: elements => gsap.to(elements, {opacity: 0.3}),
    onEnterBack: elements => gsap.to(elements, {opacity: 1}),
    onLeaveBack: elements => gsap.to(elements, {opacity: 0.3})
});
```

## 🔗 Связанные проблемы

- [002-hero-cube-complexity.md](002-hero-cube-complexity.md) - Сложность Hero Cube
- [003-performance-optimization.md](003-performance-optimization.md) - Общие проблемы производительности
- [005-component-architecture.md](005-component-architecture.md) - Архитектура компонентов

## 🔗 Связанные решения

- [animation-service-implementation.md](../solutions/animation-service-implementation.md) - Детальная реализация AnimationService
- [performance-monitoring.md](../solutions/performance-monitoring.md) - Мониторинг производительности

## 📝 План реализации

### Этап 1: Анализ (✅ Завершен)
- [x] Найти все ScrollTrigger вызовы
- [x] Выявить конфликты
- [x] Оценить влияние на производительность

### Этап 2: Проектирование (🔄 В процессе)
- [ ] Спроектировать AnimationService
- [ ] Определить API для компонентов
- [ ] Создать миграционный план

### Этап 3: Реализация
- [ ] Создать AnimationService
- [ ] Мигрировать hero-cube.js
- [ ] Мигрировать остальные компоненты
- [ ] Тестирование

### Этап 4: Оптимизация
- [ ] Настроить lagSmoothing
- [ ] Оптимизировать refreshPriority
- [ ] Провести нагрузочное тестирование

## 🧪 Критерии успеха

- [ ] Количество ScrollTrigger вызовов сокращено с 164 до <20
- [ ] Устранены все конфликты анимаций
- [ ] FPS стабильно держится на уровне 60
- [ ] Возможность добавления новых анимаций без тормозов
- [ ] Время загрузки страницы улучшено на 30%

## ⚠️ Риски

- **Высокий:** Поломка существующих анимаций при миграции
- **Средний:** Необходимость переписать большую часть компонентов
- **Низкий:** Совместимость с существующими GSAP плагинами

## 📚 Дополнительные ресурсы

### Официальная документация GSAP
- **[Банк знаний GSAP](../GSAP_DOCUMENTATION_BANK.md#проблема-001-gsap-scrolltrigger-конфликты)** - Структурированные ссылки на документацию для этой проблемы

### Дополнительные материалы
- [GSAP ScrollTrigger Best Practices](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Performance Optimization Guide](https://greensock.com/performance/)
- [Timeline vs Multiple Tweens](https://greensock.com/timeline-tips/)
