# 🏗️ План архитектуры проекта Lucrative Legal Group v3

## 📋 Обзор проекта

Модульная архитектура для веб-сайта юридической компании с учетом современных практик разработки и будущей интеграции с WordPress.

## 🎯 Цели архитектуры

- **Модульность**: Каждая секция - отдельный компонент
- **Переиспользование**: Компоненты можно использовать в разных местах
- **Изоляция**: Изменения в одном компоненте не влияют на другие
- **Тестирование**: Возможность тестировать на разных устройствах
- **WordPress Ready**: Готовность к интеграции с WordPress
- **Командная работа**: Разные разработчики могут работать над разными компонентами

## 🏗️ Структура проекта

```
/v3
├── package.json                 # Зависимости и скрипты
├── browser-sync.js             # Конфигурация для тестирования на устройствах
├── gulpfile.js                 # Gulp конфигурация
├── postcss.config.js           # PostCSS конфигурация
├── .gitignore                  # Git исключения
├── index.html                  # Главная страница (сборка компонентов)
├── README.md                   # Документация проекта
├── docs/                       # 📚 Документация
│   ├── ARCHITECTURE_PLAN.md    # Этот файл
│   ├── COMPONENT_STRUCTURE.md  # Структура компонентов
│   ├── DEVELOPMENT_WORKFLOW.md # Рабочий процесс
│   └── WORDPRESS_INTEGRATION.md # Интеграция с WordPress
├── src/                        # 🔧 Исходный код
│   ├── components/             # 🧩 Модульные компоненты
│   │   ├── hero/
│   │   │   ├── hero.html       # HTML разметка
│   │   │   ├── hero.scss       # Стили компонента
│   │   │   ├── hero.js         # JavaScript логика
│   │   │   ├── hero.php        # PHP для WordPress
│   │   │   └── README.md       # Документация компонента
│   │   ├── services/
│   │   │   ├── services.html
│   │   │   ├── services.scss
│   │   │   ├── services.js
│   │   │   ├── services.php
│   │   │   └── README.md
│   │   ├── future-marketing/
│   │   ├── whats-new/
│   │   ├── awards/
│   │   ├── case-studies/
│   │   ├── lawyer-types/
│   │   ├── portfolio/
│   │   ├── about/
│   │   ├── blog/
│   │   ├── testimonials/
│   │   └── shared/              # Общие компоненты
│   │       ├── navigation/
│   │       ├── header/
│   │       ├── footer/
│   │       └── preloader/
│   ├── styles/                 # 🎨 Общие стили
│   │   ├── abstracts/          # Переменные, миксины, функции
│   │   │   ├── _variables.scss # CSS переменные, цвета, размеры
│   │   │   ├── _mixins.scss    # SCSS миксины
│   │   │   ├── _functions.scss # SCSS функции
│   │   │   └── _breakpoints.scss # Медиа-запросы
│   │   ├── base/               # Базовые стили
│   │   │   ├── _reset.scss     # CSS Reset
│   │   │   ├── _typography.scss # Типографика
│   │   │   ├── _base.scss      # Базовые элементы
│   │   │   └── _utilities.scss # Утилитарные классы
│   │   ├── layout/             # Сетка и контейнеры
│   │   │   ├── _container.scss # Контейнеры
│   │   │   ├── _grid.scss      # CSS Grid система
│   │   │   ├── _flexbox.scss   # Flexbox утилиты
│   │   │   └── _sections.scss  # Общие стили секций
│   │   ├── components/         # Стили компонентов (автоимпорт)
│   │   └── main.scss           # Главный файл стилей
│   ├── scripts/                # 📜 Общие скрипты
│   │   ├── utils/              # Утилиты
│   │   │   ├── device-detection.js
│   │   │   ├── performance.js
│   │   │   └── helpers.js
│   │   ├── managers/           # Менеджеры
│   │   │   ├── animation-manager.js
│   │   │   ├── scroll-manager.js
│   │   │   └── component-manager.js
│   │   ├── vendors/            # Внешние библиотеки
│   │   └── main.js             # Главный файл скриптов
│   └── assets/                 # 🖼️ Ресурсы
│       ├── images/
│       ├── fonts/
│       ├── icons/
│       └── videos/
├── dist/                       # 📦 Собранные файлы (автогенерация)
│   ├── css/
│   ├── js/
│   ├── images/
│   └── index.html
└── wordpress/                  # 🔌 WordPress тема (будущее)
    ├── components/             # PHP компоненты
    ├── template-parts/
    ├── inc/
    ├── assets/                 # Собранные файлы из dist/
    ├── functions.php
    └── style.css
```

## 🧩 Компонентная архитектура

### Принципы компонентов:

1. **Самодостаточность**: Каждый компонент содержит все необходимое
2. **Переиспользование**: Можно использовать в разных контекстах
3. **Изоляция стилей**: CSS не влияет на другие компоненты
4. **Документированность**: Каждый компонент имеет README
5. **Тестируемость**: Можно тестировать изолированно

### Структура компонента:

```
components/hero/
├── hero.html           # HTML разметка
├── hero.scss           # Стили (BEM методология)
├── hero.js             # JavaScript логика (ES6 модули)
├── hero.php            # PHP для WordPress
├── README.md           # Документация компонента
└── tests/              # Тесты (опционально)
    └── hero.test.js
```

## 🎨 CSS архитектура

### Методология: **ITCSS + BEM**

1. **Settings**: Переменные, конфигурация
2. **Tools**: Миксины, функции
3. **Generic**: Reset, normalize
4. **Elements**: Базовые HTML элементы
5. **Objects**: Паттерны дизайна (сетка, контейнеры)
6. **Components**: UI компоненты
7. **Utilities**: Утилитарные классы

### CSS Custom Properties (переменные):

```scss
:root {
  // Цвета
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  --color-accent: #f093fb;
  
  // Типографика
  --font-family-primary: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
  
  // Spacing
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 2rem;
  --spacing-lg: 4rem;
  
  // Breakpoints
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}
```

## 📜 JavaScript архитектура (АКТУАЛЬНАЯ)

### Принципы (обновлено на основе реального кода):

1. **ES6 классы БЕЗ модульной системы**: Классы используются, но без import/export
2. **Глобальные функции инициализации**: `window.initComponentName = function()`
3. **Глобальная доступность классов**: `window.ClassName = ClassName`
4. **Централизованная инициализация**: Все компоненты запускаются из main.js
5. **GSAP + ScrollTrigger**: Основа для анимаций и скролл-эффектов
6. **Performance First**: Оптимизация производительности с GSAP

### Актуальный пример компонента (на основе services.js и hero-cube.js):

```javascript
// =============================================================================
// Component Name - LLG v3
// =============================================================================

// Глобальная функция инициализации (ОБЯЗАТЕЛЬНО!)
window.initComponentName = function() {
    'use strict';
    
    console.log('🔧 DEBUG: initComponentName() called');

    // Проверка зависимостей (стандартная для всех компонентов)
    function checkDependencies() {
        if (typeof gsap === 'undefined') {
            console.error('❌ Component: GSAP is not loaded.');
            return false;
        }
        
        if (typeof ScrollTrigger === 'undefined') {
            console.error('❌ Component: ScrollTrigger is not loaded.');
            return false;
        }
        
        if (typeof Lenis === 'undefined') {
            console.warn('⚠️ Component: Lenis is not loaded. Smooth scroll will be disabled.');
        }
        
        return true;
    }

    // Основной класс компонента
    class ComponentNameClass {
        constructor(element) {
            this.element = element;
            this.setupElements();
            this.init();
        }
        
        setupElements() {
            // Поиск DOM элементов
            this.container = this.element.querySelector('.js-container');
            this.items = this.element.querySelectorAll('.js-item');
            
            if (!this.container || this.items.length === 0) {
                console.error('❌ Component: Required elements not found');
                return;
            }
        }
        
        init() {
            this.setupScrollTrigger();
            this.setupEventListeners();
            console.log('✅ Component initialized');
        }
        
        setupScrollTrigger() {
            // GSAP ScrollTrigger логика
            ScrollTrigger.create({
                trigger: this.element,
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: (self) => {
                    this.updateAnimation(self.progress);
                }
            });
        }
        
        setupEventListeners() {
            // Resize handler с debounce
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 250);
            });
        }
        
        updateAnimation(progress) {
            // Анимация на основе прогресса скролла
            gsap.set(this.container, {
                x: progress * 100,
                overwrite: true
            });
        }
        
        destroy() {
            // Cleanup ScrollTrigger
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === this.element) {
                    trigger.kill();
                }
            });
        }
    }

    // Инициализация с проверками
    if (!checkDependencies()) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    const element = document.querySelector('#component-selector');
    if (element) {
        new ComponentNameClass(element);
    } else {
        console.warn('⚠️ Component element not found');
    }
    
    // Refresh после загрузки всех ресурсов
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
}

// Глобальная доступность класса (опционально)
if (typeof window !== 'undefined') {
    window.ComponentNameClass = ComponentNameClass;
}
```

### Интеграция в main.js (АКТУАЛЬНАЯ):

```javascript
// В классе LLGApp, метод start()
start() {
    // ... другие инициализации
    
    // Initialize Component Name
    this.initComponentName();
}

initComponentName() {
    if (typeof window.initComponentName === 'undefined') {
        console.warn('⚠️ Component Name not found');
        return;
    }
    
    window.initComponentName();
    console.log('✅ Component Name initialized');
}
```

## 🔧 Инструменты разработки

### Browser-Sync конфигурация:

```javascript
// browser-sync.js
const browserSync = require('browser-sync').create();

browserSync.init({
  server: {
    baseDir: './dist'
  },
  host: '0.0.0.0',        // Доступ с других устройств
  port: 3000,
  ui: { port: 3001 },
  files: [
    'src/**/*.{html,scss,js}',
    'dist/**/*.{css,js,html}'
  ],
  notify: true,
  open: false,
  ghostMode: {            // Синхронизация между устройствами
    clicks: true,
    forms: true,
    scroll: true
  }
});
```

### Gulp конфигурация:

- **Task-based**: Простые и понятные задачи
- **SCSS компиляция**: Автоматическая обработка стилей
- **JavaScript минификация**: Сжатие JS файлов
- **Live reload**: Автообновление браузера
- **File watching**: Отслеживание изменений

### PostCSS плагины:

- **Autoprefixer**: Автопрефиксы
- **CSSnano**: Минификация
- **PostCSS Preset Env**: Современный CSS
- **PurgeCSS**: Удаление неиспользуемого CSS

## 🔌 WordPress интеграция

### Структура темы:

```php
// functions.php
function enqueue_component_assets() {
  // Подключение стилей и скриптов компонентов
}

function get_component($name, $args = []) {
  // Функция для подключения компонентов
  extract($args);
  include get_template_directory() . "/components/{$name}/{$name}.php";
}
```

### Использование компонентов:

```php
// В шаблоне
<?php get_component('hero', [
  'title' => 'Professional Legal Services',
  'background' => 'hero-bg.jpg'
]); ?>
```

## 📱 Адаптивность и тестирование

### Breakpoints:

- **Mobile**: 320px - 575px
- **Tablet**: 576px - 991px  
- **Desktop**: 992px - 1199px
- **Large Desktop**: 1200px+

### Тестирование на устройствах:

1. **Browser-Sync**: Локальная сеть
2. **Responsive Design Mode**: DevTools
3. **Real Device Testing**: Физические устройства
4. **Cross-browser**: Chrome, Firefox, Safari, Edge

## 🚀 Производительность

### Оптимизации:

1. **Critical CSS**: Инлайн критических стилей
2. **Lazy Loading**: Изображения и компоненты
3. **Code Splitting**: Разделение JavaScript
4. **Image Optimization**: WebP, сжатие
5. **Caching**: Browser и CDN кеширование

### Метрики:

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 📚 Документация

Каждый компонент должен иметь:

1. **README.md**: Описание, использование, API
2. **Примеры**: Код примеров использования
3. **Changelog**: История изменений
4. **Tests**: Тесты компонента

## 🔄 Workflow разработки

1. **Создание компонента**: Генератор шаблонов
2. **Разработка**: Hot reload, live testing
3. **Тестирование**: Unit tests, visual tests
4. **Документация**: Автогенерация docs
5. **Сборка**: Production build
6. **Деплой**: WordPress интеграция

## 📈 Масштабирование

### Будущие возможности:

- **Storybook**: Каталог компонентов
- **Design System**: Система дизайна
- **A/B Testing**: Тестирование вариантов
- **Analytics**: Отслеживание производительности
- **Internationalization**: Мультиязычность

---

**Дата создания**: 14 июля 2025  
**Версия**: 1.0  
**Автор**: AI Assistant  
**Статус**: В разработке
