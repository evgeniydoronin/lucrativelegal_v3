# 🛠️ Решение: Централизованная система анимаций (AnimationService)

## 📊 Статус реализации
- [ ] Архитектура спроектирована
- [ ] Базовый сервис создан
- [ ] API определен
- [ ] Тесты написаны
- [ ] Документация создана
- [ ] Миграция компонентов завершена
- [ ] Решение внедрено ✅

**Приоритет:** 🔴 Критический  
**Оценка времени:** 3-4 дня  
**Ответственный:** [имя]  
**Дата создания:** 19.01.2025  
**Последнее обновление:** 19.01.2025

## 🎯 Цель решения

Создать централизованную систему управления анимациями, которая:
- **Устранит конфликты** между множественными ScrollTrigger
- **Повысит производительность** за счет оптимизации
- **Упростит добавление** новых анимаций
- **Обеспечит консистентность** анимаций по всему сайту

## 🏗️ Архитектура решения

### 1. Основной AnimationService (Singleton)
```javascript
// src/services/AnimationService.js
class AnimationService {
    static instance = null;
    
    constructor() {
        if (AnimationService.instance) {
            return AnimationService.instance;
        }
        
        this.scrollTriggers = new Map();
        this.timelines = new Map();
        this.activeAnimations = new Set();
        this.performanceMonitor = new PerformanceMonitor();
        
        this.setupGSAP();
        AnimationService.instance = this;
    }
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new AnimationService();
        }
        return this.instance;
    }
    
    setupGSAP() {
        // Оптимальные настройки производительности
        gsap.ticker.lagSmoothing(1000, 16);
        gsap.ticker.fps(60);
        
        gsap.defaults({
            ease: "power2.out",
            duration: 0.6
        });
        
        gsap.registerPlugin(ScrollTrigger);
        
        ScrollTrigger.config({
            autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
            ignoreMobileResize: true
        });
    }
}
```

### 2. ScrollTrigger Manager
```javascript
class ScrollTriggerManager {
    constructor(animationService) {
        this.service = animationService;
        this.triggers = new Map();
        this.batchTriggers = new Map();
    }
    
    // Создание оптимизированного ScrollTrigger
    create(config) {
        const optimizedConfig = {
            ...this.getDefaultConfig(),
            ...config,
            id: this.generateId(),
            refreshPriority: this.getNextPriority()
        };
        
        const trigger = ScrollTrigger.create(optimizedConfig);
        this.triggers.set(optimizedConfig.id, trigger);
        
        return trigger;
    }
    
    // Batch обработка для множественных элементов
    createBatch(selector, config) {
        const batchId = this.generateId();
        
        const batchTrigger = ScrollTrigger.batch(selector, {
            ...config,
            onEnter: (elements) => {
                this.service.performanceMonitor.trackBatchAnimation(elements.length);
                config.onEnter?.(elements);
            },
            onLeave: config.onLeave,
            onEnterBack: config.onEnterBack,
            onLeaveBack: config.onLeaveBack
        });
        
        this.batchTriggers.set(batchId, batchTrigger);
        return batchId;
    }
    
    // Создание master timeline для сложных анимаций
    createMasterTimeline(config) {
        const timeline = gsap.timeline({
            scrollTrigger: this.create(config.scrollTrigger)
        });
        
        this.service.timelines.set(config.id, timeline);
        return timeline;
    }
    
    getDefaultConfig() {
        return {
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        };
    }
    
    generateId() {
        return `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getNextPriority() {
        return this.triggers.size;
    }
}
```

### 3. Animation Presets
```javascript
class AnimationPresets {
    constructor(animationService) {
        this.service = animationService;
    }
    
    // Стандартные анимации появления
    fadeIn(elements, options = {}) {
        const config = {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            ...options
        };
        
        return gsap.fromTo(elements, 
            { opacity: 0, y: config.y },
            { 
                opacity: 1, 
                y: 0, 
                duration: config.duration,
                stagger: config.stagger,
                ease: config.ease
            }
        );
    }
    
    slideUp(elements, options = {}) {
        const config = {
            y: 50,
            duration: 0.6,
            stagger: 0.05,
            ...options
        };
        
        return gsap.fromTo(elements,
            { y: config.y, opacity: 0 },
            { 
                y: 0, 
                opacity: 1,
                duration: config.duration,
                stagger: config.stagger,
                ease: "back.out(1.7)"
            }
        );
    }
    
    scaleIn(elements, options = {}) {
        const config = {
            scale: 0.8,
            duration: 0.5,
            stagger: 0.1,
            ...options
        };
        
        return gsap.fromTo(elements,
            { scale: config.scale, opacity: 0 },
            { 
                scale: 1, 
                opacity: 1,
                duration: config.duration,
                stagger: config.stagger,
                ease: "back.out(1.7)"
            }
        );
    }
    
    // Горизонтальный скролл (для case-studies, future-marketing)
    horizontalScroll(container, config) {
        const scrollWidth = container.scrollWidth - container.clientWidth;
        
        return this.service.scrollTriggerManager.createMasterTimeline({
            id: config.id,
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: () => `+=${scrollWidth}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                ...config.scrollTrigger
            }
        }).to(container, {
            x: -scrollWidth,
            ease: "none"
        });
    }
}
```

### 4. Performance Monitor Integration
```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            activeAnimations: 0,
            fps: [],
            memoryUsage: [],
            scrollTriggerCount: 0
        };
        
        this.startMonitoring();
    }
    
    trackAnimation(animationId, type = 'tween') {
        this.metrics.activeAnimations++;
        
        // Предупреждение при большом количестве анимаций
        if (this.metrics.activeAnimations > 20) {
            console.warn(`⚠️ High animation count: ${this.metrics.activeAnimations}`);
        }
    }
    
    trackBatchAnimation(elementCount) {
        console.log(`📊 Batch animation: ${elementCount} elements`);
    }
    
    trackScrollTrigger() {
        this.metrics.scrollTriggerCount++;
        
        if (this.metrics.scrollTriggerCount > 15) {
            console.warn(`⚠️ High ScrollTrigger count: ${this.metrics.scrollTriggerCount}`);
        }
    }
    
    getReport() {
        return {
            activeAnimations: this.metrics.activeAnimations,
            scrollTriggers: this.metrics.scrollTriggerCount,
            averageFPS: this.getAverageFPS(),
            memoryUsage: this.getCurrentMemoryUsage()
        };
    }
    
    startMonitoring() {
        // FPS мониторинг
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.metrics.fps.push(fps);
                
                if (fps < 50) {
                    console.warn(`⚠️ Low FPS: ${fps}`);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
}
```

## 🔧 API для компонентов

### Простое использование
```javascript
// В любом компоненте
const animations = AnimationService.getInstance();

// Простая анимация появления
animations.presets.fadeIn('.card', {
    scrollTrigger: {
        trigger: '.cards-container',
        start: "top 80%"
    }
});

// Batch анимация для множественных элементов
animations.scrollTriggerManager.createBatch('.slide', {
    onEnter: elements => animations.presets.slideUp(elements),
    onLeave: elements => gsap.to(elements, { opacity: 0.3 })
});
```

### Продвинутое использование
```javascript
// Создание master timeline для сложных анимаций
const masterTL = animations.scrollTriggerManager.createMasterTimeline({
    id: 'hero-animation',
    scrollTrigger: {
        trigger: '#hero',
        start: "top top",
        end: "bottom top",
        scrub: 1
    }
});

// Добавление анимаций в timeline
masterTL
    .to('.hero-cube', { rotationY: 360, duration: 1 })
    .to('.hero-square', { scale: 2, duration: 1 }, "<0.5")
    .to('.hero-text', { opacity: 0, duration: 0.5 }, "<0.8");
```

## 📝 План миграции компонентов

### Этап 1: Hero Cube (Приоритет 1)
```javascript
// Было (hero-cube.js):
ScrollTrigger.create({
    trigger: this.element,
    onUpdate: (self) => {
        this.updateCubeRotation(self);
    }
});

// Стало:
const animations = AnimationService.getInstance();
const heroTimeline = animations.scrollTriggerManager.createMasterTimeline({
    id: 'hero-cube-master',
    scrollTrigger: {
        trigger: this.element,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => this.onScrollUpdate(self)
    }
});
```

### Этап 2: Case Studies (Приоритет 2)
```javascript
// Было (case-studies.js):
slides.forEach(slide => {
    ScrollTrigger.create({
        trigger: slide,
        onEnter: () => { /* анимация */ }
    });
});

// Стало:
const animations = AnimationService.getInstance();
animations.scrollTriggerManager.createBatch('.slide', {
    onEnter: elements => animations.presets.fadeIn(elements),
    onLeave: elements => gsap.to(elements, { opacity: 0.7 })
});
```

### Этап 3: Services (Приоритет 3)
```javascript
// Было (services.js):
const mainTimeline = gsap.timeline({
    scrollTrigger: { /* конфиг */ }
});

// Стало:
const animations = AnimationService.getInstance();
const servicesTimeline = animations.scrollTriggerManager.createMasterTimeline({
    id: 'services-cards',
    scrollTrigger: { /* оптимизированный конфиг */ }
});
```

## 🧪 Тестирование

### Unit тесты
```javascript
// tests/AnimationService.test.js
describe('AnimationService', () => {
    let animationService;
    
    beforeEach(() => {
        animationService = new AnimationService();
    });
    
    test('should be singleton', () => {
        const instance1 = AnimationService.getInstance();
        const instance2 = AnimationService.getInstance();
        expect(instance1).toBe(instance2);
    });
    
    test('should create optimized ScrollTrigger', () => {
        const trigger = animationService.scrollTriggerManager.create({
            trigger: '.test-element'
        });
        
        expect(trigger).toBeDefined();
        expect(trigger.vars.refreshPriority).toBeDefined();
    });
});
```

### Integration тесты
```javascript
// tests/integration/AnimationIntegration.test.js
describe('Animation Integration', () => {
    test('should handle multiple components without conflicts', async () => {
        // Создаем несколько компонентов
        const heroComponent = new HeroCubeController(heroElement);
        const servicesComponent = new ServicesComponent(servicesElement);
        
        // Проверяем отсутствие конфликтов
        const report = animationService.performanceMonitor.getReport();
        expect(report.scrollTriggers).toBeLessThan(10);
    });
});
```

## 📈 Ожидаемые результаты

### До внедрения:
- ScrollTrigger вызовов: 164
- Конфликты анимаций: Есть
- FPS при скролле: 30-45
- Сложность добавления анимаций: Высокая

### После внедрения:
- ScrollTrigger вызовов: <20
- Конфликты анимаций: Отсутствуют
- FPS при скролле: 55-60
- Сложность добавления анимаций: Низкая

## ⚠️ Риски и митигация

### Риск: Поломка существующих анимаций
**Митигация:** Поэтапная миграция с тестированием каждого компонента

### Риск: Сложность отладки централизованной системы
**Митигация:** Детальное логирование и dev-tools интеграция

### Риск: Производительность централизованного сервиса
**Митигация:** Встроенный мониторинг производительности

## 🔗 Связанные документы

- [001-gsap-scrolltrigger-conflicts.md](../issues/001-gsap-scrolltrigger-conflicts.md) - Проблема, которую решает
- [002-hero-cube-complexity.md](../issues/002-hero-cube-complexity.md) - Упрощение Hero Cube
- [performance-monitoring.md](performance-monitoring.md) - Мониторинг производительности

## 📚 Дополнительные ресурсы

- [GSAP ScrollTrigger Documentation](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Singleton Pattern in JavaScript](https://refactoring.guru/design-patterns/singleton/javascript/example)
- [Performance Best Practices](https://greensock.com/performance/)
