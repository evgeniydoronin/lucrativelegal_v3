# 📋 Чек-лист добавления нового компонента

## ⚠️ ВАЖНО: Обязательные шаги для каждого нового компонента

### 1. 📁 Создание файлов компонента

```
src/components/[component-name]/
├── [component-name].html          # HTML разметка
├── [component-name].scss          # Стили (опционально)
└── [component-name].js            # JavaScript (опционально)
```

### 2. 🎨 Подключение стилей (если есть .scss)

**Файл:** `src/styles/main.scss`

```scss
// Добавить в секцию Components
@use 'components/[component-name]';
```

### 3. 📜 Подключение скрипта (если есть .js)

**Файл:** `src/templates/scripts.html`

```html
<!-- [Component Name] Component -->
<script src="js/components/[component-name].js"></script>
```

**⚠️ ПОРЯДОК ВАЖЕН:** Добавлять перед `main.js`

### 4. 🔧 Инициализация в main.js

**Файл:** `src/scripts/main.js`

#### A. Добавить метод инициализации:
```javascript
initComponentName() {
    if (typeof window.initComponentName === 'undefined') {
        console.warn('⚠️ Component Name not found');
        return;
    }
    
    window.initComponentName();
    console.log('✅ Component Name initialized');
}
```

#### B. Вызвать в методе start():
```javascript
start() {
    // ... другие инициализации
    
    // Initialize Component Name
    this.initComponentName();
    
    // ... остальные
}
```

### 5. 📝 Подключение в index.html

**Файл:** `src/index.html`

```html
@@include('components/[component-name]/[component-name].html', {
    "param1": "value1",
    "param2": "value2"
})
```

## 🚨 Частые ошибки и их решения

### ❌ "Component not found" в консоли
**Причина:** Скрипт не подключен в `src/templates/scripts.html`
**Решение:** Добавить `<script src="js/components/[name].js"></script>`

### ❌ Стили не применяются
**Причина:** Не добавлен импорт в `src/styles/main.scss`
**Решение:** Добавить `@use 'components/[name]';`

### ❌ Функция initComponent не определена
**Причина:** В JS файле нет `window.initComponent = function()`
**Решение:** Добавить глобальную функцию инициализации

### ❌ Анимации не работают
**Причина:** Скрипт загружается после main.js
**Решение:** Переместить в `scripts.html` ПЕРЕД `main.js`

## 📋 Шаблон JavaScript компонента

```javascript
// =============================================================================
// Component Name - LLG v3
// =============================================================================

// Глобальная функция инициализации (ОБЯЗАТЕЛЬНО!)
window.initComponentName = function() {
    'use strict';
    
    console.log('🔧 DEBUG: initComponentName() called');

    // Проверка зависимостей
    function checkDependencies() {
        if (typeof gsap === 'undefined') {
            console.error('❌ Component: GSAP is not loaded.');
            return false;
        }
        
        if (typeof ScrollTrigger === 'undefined') {
            console.error('❌ Component: ScrollTrigger is not loaded.');
            return false;
        }
        
        return true;
    }

    // Основной класс компонента
    class ComponentClass {
        constructor(element) {
            this.element = element;
            this.init();
        }
        
        init() {
            // Инициализация компонента
            console.log('✅ Component initialized');
        }
        
        destroy() {
            // Cleanup
        }
    }

    // Инициализация с проверками
    if (!checkDependencies()) return;
    
    const element = document.querySelector('#component-selector');
    if (element) {
        new ComponentClass(element);
    } else {
        console.warn('⚠️ Component element not found');
    }
}
```

## 📋 Шаблон SCSS компонента

```scss
// =============================================================================
// Component Name - LLG v3
// =============================================================================

@use '../variables' as *;

.component-name {
    // Стили компонента
    
    // Responsive
    @media (max-width: 768px) {
        // Мобильные стили
    }
}
```

## ✅ Финальная проверка

- [ ] HTML файл создан в `src/components/[name]/`
- [ ] SCSS импортирован в `src/styles/main.scss`
- [ ] JS подключен в `src/templates/scripts.html`
- [ ] Инициализация добавлена в `src/scripts/main.js`
- [ ] Компонент подключен в `src/index.html`
- [ ] Сервер перезапущен (`npm run dev`)
- [ ] В консоли появляются сообщения компонента
- [ ] Анимации/функционал работают

## 🔄 Команды для тестирования

```bash
# Перезапуск сервера
npm run dev

# Проверка сборки
npm run build
```

---

**Дата создания:** 17 июля 2025  
**Последнее обновление:** 17 июля 2025  
**Статус:** ✅ Актуально
