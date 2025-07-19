# 🚨 Проблема #003: Проблемы производительности

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
Система анимаций работает неэффективно и вызывает серьезные тормоза:
- **Отсутствует lagSmoothing** для GSAP
- **Нет ограничения FPS** для тяжелых анимаций
- **Множественные вычисления** на каждом кадре
- **Неэффективное использование willChange**
- **Отсутствует мониторинг производительности**

### Критичность
Проблемы производительности **блокируют добавление новых анимаций** и создают плохой пользовательский опыт.

## 📊 Метрики и статистика

### Текущие показатели производительности:
- **FPS при скролле:** 30-45 (вместо 60)
- **Время загрузки:** 3.2 сек (медленно)
- **Memory usage:** 85MB+ (высокий)
- **CPU usage:** 60-80% при анимациях

### Проблемные участки:
- `hero-cube.js`: Throttling только 16ms (недостаточно)
- `main.js`: Отсутствует lagSmoothing
- Все компоненты: Нет оптимизации willChange
- ScrollTrigger: Нет refreshPriority настроек

## 🔍 Конкретные примеры кода

### Пример 1: Отсутствие lagSmoothing в main.js
```javascript
// ❌ ПРОБЛЕМА: Нет защиты от лагов
this.lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.3,
    // Отсутствует lagSmoothing!
});

// ❌ ПРОБЛЕМА: Нет ограничения FPS
gsap.ticker.add((time) => {
    this.lenis.raf(time * 1000);
});

// ❌ ПРОБЛЕМА: Отключен lagSmoothing
gsap.ticker.lagSmoothing(0); // Это плохо!
```

### Пример 2: Неэффективный throttling в hero-cube.js
```javascript
// ❌ ПРОБЛЕМА: Слишком частые обновления
updateCubeRotation(scrollTrigger) {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateThrottle) {
        return; // Только 16ms throttling недостаточно
    }
    this.lastUpdate = now;
    
    // Тяжелые вычисления на каждом кадре
    const scrollProgress = this.calculateScrollProgress();
    const heroRect = this.element.getBoundingClientRect(); // Дорого!
    const realRect = this.square.getBoundingClientRect(); // Еще дороже!
}
```

### Пример 3: Отсутствие willChange оптимизации
```javascript
// ❌ ПРОБЛЕМА: willChange не управляется
gsap.set(this.square, {
    scaleX: scaleX,
    scaleY: scaleY,
    // Нет willChange: "transform"
    // Нет сброса willChange после анимации
});
```

### Пример 4: Множественные DOM запросы
```javascript
// ❌ ПРОБЛЕМА: DOM запросы в цикле анимации
updateTextVisibility(scrollProgress) {
    // Каждый кадр!
    const heroRect = this.element.getBoundingClientRect();
    const realRect = this.square.getBoundingClientRect();
    const realWidth = realRect.width;
    const realHeight = realRect.height;
}
```

## 💡 Предлагаемое решение

### 1. Настройка GSAP производительности
```javascript
// ✅ ХОРОШО: Правильная настройка GSAP
class PerformanceOptimizer {
    static setupGSAP() {
        // Настройка lagSmoothing
        gsap.ticker.lagSmoothing(1000, 16);
        
        // Ограничение FPS для тяжелых анимаций
        gsap.ticker.fps(30);
        
        // Настройка по умолчанию для всех анимаций
        gsap.defaults({
            ease: "power2.out",
            duration: 0.6
        });
        
        // Регистрация плагинов
        gsap.registerPlugin(ScrollTrigger);
        
        // Настройка ScrollTrigger
        ScrollTrigger.config({
            autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
        });
    }
}
```

### 2. Эффективное управление willChange
```javascript
// ✅ ХОРОШО: Автоматическое управление willChange
class WillChangeManager {
    static setOptimization(element, properties = "transform") {
        gsap.set(element, { willChange: properties });
    }
    
    static clearOptimization(element) {
        gsap.set(element, { willChange: "auto" });
    }
    
    static withOptimization(element, animation, properties = "transform") {
        this.setOptimization(element, properties);
        
        return animation.then(() => {
            this.clearOptimization(element);
        });
    }
}

// Использование
WillChangeManager.withOptimization(element, 
    gsap.to(element, { x: 100, duration: 1 })
);
```

### 3. Кэширование DOM запросов
```javascript
// ✅ ХОРОШО: Кэширование дорогих вычислений
class DOMCache {
    constructor() {
        this.cache = new Map();
        this.lastUpdate = 0;
        this.cacheTimeout = 16; // Обновляем кэш максимум раз в 16ms
    }
    
    getBoundingRect(element, forceUpdate = false) {
        const now = Date.now();
        const key = element;
        
        if (!forceUpdate && 
            this.cache.has(key) && 
            (now - this.lastUpdate) < this.cacheTimeout) {
            return this.cache.get(key);
        }
        
        const rect = element.getBoundingClientRect();
        this.cache.set(key, rect);
        this.lastUpdate = now;
        
        return rect;
    }
    
    clearCache() {
        this.cache.clear();
    }
}
```

### 4. Адаптивный throttling
```javascript
// ✅ ХОРОШО: Адаптивный throttling в зависимости от нагрузки
class AdaptiveThrottling {
    constructor() {
        this.baseThrottle = 16; // 60fps
        this.currentThrottle = this.baseThrottle;
        this.performanceHistory = [];
    }
    
    shouldUpdate() {
        const now = performance.now();
        
        if (now - this.lastUpdate < this.currentThrottle) {
            return false;
        }
        
        // Измеряем производительность
        const frameTime = now - this.lastUpdate;
        this.performanceHistory.push(frameTime);
        
        // Адаптируем throttling
        this.adaptThrottling();
        
        this.lastUpdate = now;
        return true;
    }
    
    adaptThrottling() {
        if (this.performanceHistory.length < 10) return;
        
        const avgFrameTime = this.performanceHistory
            .slice(-10)
            .reduce((a, b) => a + b) / 10;
        
        // Если кадры медленные - увеличиваем throttling
        if (avgFrameTime > 20) {
            this.currentThrottle = Math.min(33, this.currentThrottle + 2); // До 30fps
        } else if (avgFrameTime < 14) {
            this.currentThrottle = Math.max(16, this.currentThrottle - 1); // До 60fps
        }
    }
}
```

### 5. Мониторинг производительности
```javascript
// ✅ ХОРОШО: Реальный мониторинг производительности
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            memoryUsage: [],
            animationCount: 0
        };
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        // FPS мониторинг
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.metrics.fps.push(fps);
                
                // Предупреждение о низком FPS
                if (fps < 45) {
                    console.warn(`⚠️ Low FPS detected: ${fps}`);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
        
        // Memory мониторинг
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory.usedJSHeapSize / 1024 / 1024;
                this.metrics.memoryUsage.push(memory);
                
                if (memory > 100) {
                    console.warn(`⚠️ High memory usage: ${memory.toFixed(1)}MB`);
                }
            }, 5000);
        }
    }
    
    getReport() {
        const avgFPS = this.metrics.fps.length > 0 
            ? this.metrics.fps.reduce((a, b) => a + b) / this.metrics.fps.length 
            : 0;
            
        return {
            averageFPS: Math.round(avgFPS),
            currentMemory: performance.memory 
                ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + 'MB'
                : 'N/A',
            activeAnimations: this.metrics.animationCount
        };
    }
}
```

## 🔗 Связанные проблемы

- [001-gsap-scrolltrigger-conflicts.md](001-gsap-scrolltrigger-conflicts.md) - ScrollTrigger конфликты
- [002-hero-cube-complexity.md](002-hero-cube-complexity.md) - Сложность Hero Cube
- [005-component-architecture.md](005-component-architecture.md) - Архитектура компонентов

## 🔗 Связанные решения

- [performance-monitoring.md](../solutions/performance-monitoring.md) - Детальный мониторинг
- [animation-service-implementation.md](../solutions/animation-service-implementation.md) - Оптимизированная система анимаций

## 📝 План реализации

### Этап 1: Анализ (✅ Завершен)
- [x] Измерить текущую производительность
- [x] Выявить узкие места
- [x] Определить критические участки

### Этап 2: Базовые оптимизации
- [ ] Настроить GSAP lagSmoothing
- [ ] Добавить ограничение FPS
- [ ] Внедрить willChange управление
- [ ] Оптимизировать throttling

### Этап 3: Продвинутые оптимизации
- [ ] Создать DOMCache систему
- [ ] Внедрить адаптивный throttling
- [ ] Оптимизировать ScrollTrigger настройки
- [ ] Добавить мониторинг производительности

### Этап 4: Тестирование
- [ ] Нагрузочное тестирование
- [ ] Тестирование на разных устройствах
- [ ] Профилирование памяти
- [ ] A/B тестирование производительности

## 🧪 Критерии успеха

- [ ] FPS стабильно 60 при скролле
- [ ] Время загрузки < 2 сек
- [ ] Memory usage < 50MB
- [ ] CPU usage < 30% при анимациях
- [ ] Отсутствие лагов при добавлении новых анимаций

## ⚠️ Риски

- **Средний:** Чрезмерная оптимизация может ухудшить качество анимаций
- **Средний:** Сложность настройки адаптивных систем
- **Низкий:** Совместимость с различными браузерами

## 📈 Ожидаемые улучшения

### До оптимизации:
- FPS: 30-45
- Загрузка: 3.2 сек
- Память: 85MB+
- CPU: 60-80%

### После оптимизации:
- FPS: 55-60
- Загрузка: <2 сек
- Память: <50MB
- CPU: <30%

## 📚 Дополнительные ресурсы

- [GSAP Performance Tips](https://greensock.com/performance/)
- [Web Performance Optimization](https://developers.google.com/web/fundamentals/performance)
- [CSS will-change Property](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
