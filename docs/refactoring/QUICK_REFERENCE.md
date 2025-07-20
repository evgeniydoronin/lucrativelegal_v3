# ⚡ Quick Reference - Component Development
## Быстрый справочник по разработке компонентов

### 🚨 КРИТИЧЕСКИЕ ОШИБКИ - НЕ ДЕЛАЙТЕ ТАК!

```javascript
// ❌ НЕ ВЫЗЫВАЙТЕ super.getState() - его НЕТ!
getState() {
    return { ...super.getState(), myProp: this.myProp };
}

// ❌ НЕ инициализируйте config в constructor
constructor(element) {
    super(element);
    this.config = {}; // Слишком рано!
}

// ❌ НЕ забывайте получить AnimationService
setupAnimations() {
    this.timeline = this.animationService.create(); // undefined!
}

// ❌ НЕ забывайте вызвать super.destroy()
destroy() {
    this.timeline?.kill();
    // Забыли super.destroy()!
}
```

### ✅ ПРАВИЛЬНЫЕ РЕШЕНИЯ

```javascript
// ✅ getState() без super
getState() {
    return {
        isInitialized: this.isInitialized,
        isDestroyed: this.isDestroyed,
        id: this.id,
        myProp: this.myProp
    };
}

// ✅ config в beforeInit()
beforeInit() {
    super.beforeInit();
    this.config = { /* настройки */ };
}

// ✅ Получаем AnimationService
setupAnimations() {
    this.animationService = window.AnimationService?.getInstance();
    if (!this.animationService) {
        this.setupAnimationsFallback();
        return;
    }
    // Используем AnimationService
}

// ✅ Всегда вызываем super.destroy()
destroy() {
    this.timeline?.kill();
    this.myArray = [];
    super.destroy(); // ОБЯЗАТЕЛЬНО!
}
```

### 📋 ШАБЛОН КОМПОНЕНТА

```javascript
class MyComponent extends AnimatedInteractiveComponent {
    constructor(element) {
        super(element, { debug: true });
        this.myProp = null;
    }
    
    beforeInit() {
        super.beforeInit();
        this.config = { /* настройки */ };
    }
    
    setupElements() {
        super.setupElements();
        this.myElement = this.element.querySelector('.my-element');
        return !!this.myElement;
    }
    
    setupAnimations() {
        this.animationService = window.AnimationService?.getInstance();
        if (!this.animationService) {
            this.setupAnimationsFallback();
            return;
        }
        // AnimationService код
    }
    
    setupAnimationsFallback() {
        // GSAP fallback
    }
    
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            myProp: this.myProp
        };
    }
    
    destroy() {
        // Очистка ресурсов
        super.destroy();
    }
}
```

### 🔧 ПОЛЕЗНЫЕ СНИППЕТЫ

```javascript
// Проверка метода
if (typeof super.methodName === 'function') {
    super.methodName();
}

// Безопасное получение AnimationService
this.animationService = window.AnimationService?.getInstance();

// Стандартный getState
getState() {
    return {
        isInitialized: this.isInitialized,
        isDestroyed: this.isDestroyed,
        id: this.id
    };
}
```

### 📚 ССЫЛКИ
- [Полное руководство](./COMPONENT_DEVELOPMENT_GUIDE.md)
- [BaseComponent API](./solutions/base-component-architecture.md)
- [AnimationService](./solutions/animation-service-implementation.md)
